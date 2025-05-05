require("dotenv").config();

const DataBaseUral=process.env.MONGO_URI;

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const app = express();
const CostemError = require("./error.js");
const userRout = require("./router/user.js");
const shopkeeperRout = require("./router/shopkeeper.js");

//require razprpay
const Razorpay = require("razorpay");
const crypto = require("crypto"); // For secure payment verification

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//model DB
const Item = require("./model/index.js");
const User = require("./model/user.js");
const ShopKeeper=require('./model/shopkeeper.js')

// passport
const passport = require("passport");
const localStrategy = require("passport-local");

//cookieParser
const cookieParser = require("cookie-parser");
app.use(cookieParser("keyboard cat"));

//express session
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat", // It's better to store the secret in environment variables
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Ensures the cookie cannot be accessed via JavaScript
      secure: process.env.NODE_ENV === 'production', // Make cookie secure in production (only sent over HTTPS)
    },
    store: MongoStore.create({
      mongoUrl: DataBaseUral, // Use environment variable for MongoDB URI
      collectionName: "sessions", // Custom name for session collection
      ttl: 7 * 24 * 60 * 60, // Set TTL for the session in seconds (7 days in this case)
    }),
  })
);

//connect-flash for message
app.use(flash());

//passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

//passport seialize and desialize middleware
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));



//DB connection
async function main() {
  await mongoose.connect(DataBaseUral);
}
main()
  .then(() => {
    console.log("connection successfull");
  })
  .catch((err) => {
    console.log("DB err", err);
  });

//error handel for async fun using asyncWrap
function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}



//flash middlewaier
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.msg = req.flash("msg");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

//rediret to user fornt page
app.get(
  "/users/:userId",
  asyncWrap(async (req, res, next) => {
    let { userId } = req.params;
    let items = await Item.find();
    let userData = await User.findById(userId);
    res.render("./user/index.ejs", { items, userData });
  })
);

//payment method
app.post(
  "/user/:userId/:itemId/buy",
  asyncWrap(async (req, res, next) => {
    const { userId, itemId } = req.params;
    const item = await Item.findById(itemId);

    if (!item) {
      throw new CostemError(404, "Item not found");
    }

    const amount = item.i_price * 100; // Convert to paise (Razorpay expects amount in paise)

    // Razorpay order options
    const orderOptions = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${itemId}`,
      payment_capture: 1, // Auto-capture the payment
    };

    try {
      // Create Razorpay order
      const order = await razorpay.orders.create(orderOptions);

      // Send order details to the frontend
      res.render("payment", {
        orderId: order.id,
        keyId: process.env.RAZORPAY_KEY_ID, // Pass Razorpay Key ID to frontend
        amount: amount,
      });
    } catch (error) {
      console.error(error);
      throw new CostemError(500, "Error creating Razorpay order");
    }
  })
);

// Payment verification route
app.post("/payment/verify", async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;

  // Razorpay secret key (for signature verification)
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // Create a string from payment details to verify
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  // Create HMAC hash using the secret key
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  // Compare the generated signature with the received one
  if (expectedSignature === razorpay_signature) {
    // Payment is successful
    res.json({ message: "Payment verified successfully!" });
    // Here, you can handle the success logic like updating the order status in your database
  } else {
    // Payment failed
    res.status(400).json({ message: "Payment verification failed!" });
  }

  if (expectedSignature === razorpay_signature) {
    try {
      // Capture manually just in case
      await razorpay.payments.capture(razorpay_payment_id, amount, "INR");
      return res.json({ message: "Payment verified and captured successfully!" });
    } catch (err) {
      console.error("Manual capture failed:", err);
      return res.status(500).json({ message: "Payment verified but capture failed" });
    }
  }
});

app.get('/adduser',asyncWrap(
  async(req,res,next)=>{
    let nawShopkeeper=new ShopKeeper({
       s_name:'nanu',
       s_email:'nanu@gmail.com',
       s_password:'12345',
    })
    await nawShopkeeper.save();
    res.send('shopkeeper')
  }
))

//root
app.get("/", (req, res, next) => {
  // console.log(req.user)
  res.render("rootForm.ejs");
});

//user router
app.use("/user", userRout);

//user router
app.use("/shopkeeper", shopkeeperRout);

//this path make for those image that is clackble
app.get(
  "/tab/:id",
  asyncWrap(async (req, res) => {
    let { id } = req.params;
    // console.log(id)
    let items = await Item.find({ i_brand_name: id });
    res.render("./user/tabPage.ejs", { items });
  })
);

//search
app.post("/search", (req, res) => {
  const { q } = req.body;
  console.log(q); // Should log your input value
  res.redirect(`/tab/${q}`);
});

//*
app.get("*", (req, res) => {
  throw new CostemError(400, "page not found");
});

//middlewar for error handling
app.use((err, req, res, next) => {
  let { status = 500, message = "some error" } = err;
  res.status(status).send(message);
});

//server listening on 3000 port
app.listen(3000, () => {
  console.log("connect 3000");
});
