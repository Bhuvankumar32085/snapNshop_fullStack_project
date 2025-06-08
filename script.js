require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI;

// Models
const Item = require("./model/index.js");
const User = require("./model/user.js");
const ShopKeeper = require("./model/shopkeeper.js");

// Routers (optional)
const userRout = require("./router/user.js");
const shopkeeperRout = require("./router/shopkeeper.js");

// Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Connect MongoDB
async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser("keyboard cat"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
    store: MongoStore.create({
      mongoUrl: DB_URI,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60,
    }),
  })
);

app.use(flash());

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & user in locals middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.msg = req.flash("msg");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Async wrapper helper
const asyncWrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Routes

app.get("/", (req, res) => {
  res.render("rootForm");
});

app.get(
  "/users/:userId",
  asyncWrap(async (req, res) => {
    const { userId } = req.params;
    const items = await Item.find();
    const userData = await User.findById(userId);
    res.render("user/index", { items, userData });
  })
);

// Razorpay order creation
app.post(
  "/user/:userId/:itemId/buy",
  asyncWrap(async (req, res) => {
    const { userId, itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).send("Item not found");
    }

    // Replace with actual shopkeeper id related to item
    const shopkeeperId = item.shopkeeperId || "replace_with_actual_shopkeeper_id";

    const amount = item.i_price * 100; // paise

    const orderOptions = {
      amount,
      currency: "INR",
      receipt: `receipt_${itemId}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(orderOptions);

    res.render("payment", {
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount,
      userId,
      shopkeeperId,
    });
  })
);

// Razorpay payment verification + update shopkeeper buyers
app.post(
  "/payment/verify",
  asyncWrap(async (req, res) => {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      shopkeeperId,
    } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const shopkeeper = await ShopKeeper.findById(shopkeeperId);
      if (!shopkeeper)
        return res.status(404).json({ message: "Shopkeeper not found" });

      // Add user to shopkeeper buyers if not already present
      if (!shopkeeper.buyers.includes(user._id)) {
        shopkeeper.buyers.push(user._id);
        await shopkeeper.save();
      }

      return res.json({
        message: "Payment verified successfully!",
        user: {
          id: user._id,
          email: user.u_email,
          phone: user.u_phone_num,
          location: user.u_location,
        },
      });
    } else {
      return res.status(400).json({ message: "Payment verification failed!" });
    }
  })
);

// Clickable brand tab route
app.get("/tab/:id", asyncWrap(async (req, res) => {
  const { id } = req.params;
  const items = await Item.find({ i_brand_name: id });
  res.render("./user/tabPage.ejs", { items });
}));

// Search redirect
app.post("/search", (req, res) => {
  const { q } = req.body;
  res.redirect(`/tab/${q}`);
});

// Optional routes
app.use("/user", userRout);
app.use("/shopkeeper", shopkeeperRout);

// Catch all for invalid routes
app.all("*", (req, res) => {
  res.status(404).send("Page Not Found");
});

// Error handler
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!" } = err;
  res.status(status).send(message);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
