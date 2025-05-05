const express = require("express");
const shopkeeperRout = express.Router();
const Item = require("../model/index.js");
const User = require("../model/user.js");
const ShopKeeper = require("../model/shopkeeper.js");
const CostemError = require("../error.js");
const {userSchema,shopkeeperSchema}=require('../schema.js')

const validationShopkeeperSchema = (req, res, next) => {
  const { error } = shopkeeperSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new CostemError(400, msg);
  } else {
    next();
  }
};

//error handel for async fun using asyncWrap
function asyncWrap(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
}

// footer shopkeeper link <<1>>
shopkeeperRout.get("/loingShopkeeper", (req, res) => {
  res.render("./loginAndSigin/LoingShopkeeper.ejs");
});

//login for shopkeeper <<2>>
shopkeeperRout.post(
  "/",validationShopkeeperSchema,
  asyncWrap(async (req, res, next) => {
    let { s_name: name, s_email: email, s_password: pass } = req.body;
    // console.log(req.body)
    let shopkeeperdata = await ShopKeeper.findOne({
      s_email: email,
    });
    console.log(shopkeeperdata)
    let items = await Item.find();

    if (
      name == shopkeeperdata.s_name &&
      email == shopkeeperdata.s_email &&
      pass == shopkeeperdata.s_password
    ) {
      res.render("shopkeeper/shopindex.ejs", { shopkeeperdata, items });
    }

    if(name!= shopkeeperdata.s_name){
      let err = "enter right name";
      next(new CostemError(404,err));
    }
    if(email!= shopkeeperdata.s_email){
      let err = "enter right email";
      next(new CostemError(500,err));
    }
    if(pass!= shopkeeperdata.s_password){
      let err = "enter right password";
      next(new CostemError(500,err));
    }
  })
);

//show All User
shopkeeperRout.get(
  "/user",
  asyncWrap(async (req, res, next) => {
    let allUser = await User.find();
    console.log(allUser)
    res.render("./shopkeeper/showAllUser.ejs", { allUser });
  })
);

//user delete for shopkeeper side
shopkeeperRout.delete(
  "/:id/user",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let userData = await User.findByIdAndDelete(id);
    res.redirect("/shopkeeper/user");
  })
);

//add item for shopkeeper side <<1>>
shopkeeperRout.get("/:shopkeeperId/additem", (req, res) => {
  let { shopkeeperId } = req.params;
  res.render("./shopkeeper/addItem.ejs", { shopkeeperId });
});

// <<2>>
shopkeeperRout.post(
  "/:shopkeeperId/additem",
  asyncWrap(async (req, res, next) => {
    let { shopkeeperId } = req.params;
    let formData = req.body.u;
    let addItem = await Item.insertOne({ ...formData });
    res.redirect(`/shopkeeper/${shopkeeperId}`);
  })
);

//this page for redirect shopkeeper page
shopkeeperRout.get(
  "/:id",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let shopkeeperdata = await ShopKeeper.findById(id);
    let items = await Item.find();
    res.render("./shopkeeper/shopIndex.ejs", { shopkeeperdata, items });
  })
);

//item delete path <<1>>
shopkeeperRout.get("/:itemId/:shopkeeperId/delete", (req, res) => {
  let { itemId, shopkeeperId } = req.params;
  res.render("./shopkeeper/deleteForm.ejs", { itemId, shopkeeperId });
});

// <<2>>
shopkeeperRout.delete(
  "/:itemId/:shopkeeperId/delete",
  asyncWrap(async (req, res, next) => {
    let { itemId, shopkeeperId } = req.params;
    let { s_email: email, s_password: pass } = req.body;
    let shopKeeperdata = await ShopKeeper.findById(shopkeeperId);

    if (shopKeeperdata.s_email == email && shopKeeperdata.s_password == pass) {
      let itemData = await Item.findByIdAndDelete(itemId);
      res.redirect(`/shopkeeper/${shopkeeperId}`);
    } else {
      next(new CostemError("incorrect information"));
    }
  })
);

//item edit path <<1>>
shopkeeperRout.get(
  "/:itemId/:shopkeeperId/edit",
  asyncWrap(async (req, res, next) => {
    let { itemId, shopkeeperId } = req.params;
    let itemData = await Item.findByIdAndUpdate(itemId);
    res.render("./shopkeeper/editForm.ejs", { itemId, shopkeeperId, itemData });
  })
);

// <<2>>
shopkeeperRout.put(
  "/:itemId/:shopkeeperId/edit",
  asyncWrap(async (req, res, next) => {
    let { itemId, shopkeeperId } = req.params;
    let formData = req.body.u;
    let UpItem = await Item.findByIdAndUpdate(itemId, { ...formData });
    res.redirect(`/shopkeeper/${shopkeeperId}`);
  })
);

module.exports = shopkeeperRout;
