const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const app = express();
const CostemError = require("./error.js");
const userRout = require("./router/user.js");
const shopkeeperRout = require("./router/shopkeeper.js");
const userSchema=require('./schema.js')



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

//DB connection
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/snapnshop");
}
main()
  .then(() => {
    console.log("connection successfull");
  })
  .catch((err) => {
    console.log("DB err", err);
  });

const Item = require("./model/index.js");
const User = require("./model/user.js");

//error handel for async fun using asyncWrap
function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

//root
app.get("/", (req, res) => {
  res.render("rootForm.ejs");
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
