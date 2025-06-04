// ==========================
//  Load Environment Variables
// ==========================
require("dotenv").config();

// ==========================
//  App Configuration
// ==========================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URI;

// ==========================
//  Models and Routes
// ==========================
const Item = require("./model/index.js");
const User = require("./model/user.js");
const ShopKeeper = require("./model/shopkeeper.js");
const userRout = require("./router/user.js");
const shopkeeperRout = require("./router/shopkeeper.js");
const CostemError = require("./error.js");

// ==========================
//  Razorpay Setup
// ==========================
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================
//  Mongoose Connection
// ==========================
async function connectDB() {
  try {
    await mongoose.connect(DB_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
  }
}
connectDB();

// ==========================
//  App Middlewares
// ==========================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(cookieParser("keyboard cat"));

// Session config with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
  store: MongoStore.create({
    mongoUrl: DB_URI,
    collectionName: "sessions",
    ttl: 7 * 24 * 60 * 60,
  }),
}));

app.use(flash());

// ==========================
//  Passport Configuration
// ==========================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ==========================
//  Global Flash & User Middleware
// ==========================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.msg = req.flash("msg");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ==========================
//  Utility - Async Wrapper
// ==========================
const asyncWrap = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// ==========================
//  Routes
// ==========================

// Home route
app.get("/", (req, res) => {
  res.render("rootForm.ejs");
});

// Redirect to user's homepage
app.get("/users/:userId", asyncWrap(async (req, res) => {
  const { userId } = req.params;
  const items = await Item.find();
  const userData = await User.findById(userId);
  res.render("./user/index.ejs", { items, userData });
}));

// Payment route (Razorpay order creation)
app.post("/user/:userId/:itemId/buy", asyncWrap(async (req, res) => {
  const { itemId } = req.params;
  const item = await Item.findById(itemId);

  if (!item) throw new CostemError(404, "Item not found");

  const amount = item.i_price * 100;

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
  });
}));

// Payment verification
app.post("/payment/verify", asyncWrap(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      // Optional: Razorpay automatic capture works by default if `payment_capture: 1`
      // If needed to capture manually:
      // await razorpay.payments.capture(razorpay_payment_id, amount, "INR");

      return res.json({ message: "Payment verified successfully!" });
    } catch (err) {
      console.error("Capture failed:", err);
      return res.status(500).json({ message: "Payment verified but capture failed" });
    }
  } else {
    return res.status(400).json({ message: "Payment verification failed!" });
  }
}));

// Add default shopkeeper
app.get('/adduser', asyncWrap(async (req, res) => {
  const nawShopkeeper = new ShopKeeper({
    s_name: 'nanu',
    s_email: 'nanu@gmail.com',
    s_password: '12345',
  });
  await nawShopkeeper.save();
  res.send('shopkeeper created');
}));

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

// User and Shopkeeper Routes
app.use("/user", userRout);
app.use("/shopkeeper", shopkeeperRout);

// Catch-all route for invalid paths
app.all("*", (req, res) => {
  throw new CostemError(400, "Page Not Found");
});

// ==========================
//  Error Handler Middleware
// ==========================
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!" } = err;
  res.status(status).send(message);
});

// ==========================
//  Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
