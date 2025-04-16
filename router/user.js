const express = require("express");
const userRout = express.Router();
const Item = require("../model/index.js");
const User = require("../model/user.js");
const joi = require("joi");
const CostemError = require('../error.js');
const {userSchema,shopkeeperSchema}=require('../schema.js')

const validationUserSchema = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
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

//creteAccount btn on root page <<1>>
userRout.get("/createAccountForm", (req, res) => {
  res.render("./loginAndSigin/createForm.ejs");
});

// <<2>>
userRout.post(
  "/createAccountForUser",validationUserSchema,
  asyncWrap(async (req, res, next) => {
    let { u_name, u_email, u_password, u_phone_num, u_location } = req.body;
    // console.log(u_name, u_email,u_password,u_phone_num,u_location);
    let user1 = new User({
      u_name: u_name,
      u_email: u_email,
      u_password: u_password,
      u_phone_num: u_phone_num,
      u_location: u_location,
      u_by_item_list: "none",
    });
    let userData = await user1.save();
    res.redirect(`/users/${userData._id}`);
  })
);

//login btn on root <<1>>
userRout.get("/loginform", (req, res) => {
  res.render("./loginAndSigin/loginform.ejs");
});

//login <<2>>
userRout.post(
    "/",
    asyncWrap(async (req, res, next) => {
      const { u_email: email, u_phone_num: num, u_password: pass } = req.body;
  
      const userData = await User.findOne({ u_email: email });
  
      // 1. Check if user exists
      if (!userData) {
        return next(new CostemError( 404,"User not found with this email"));
      }
  
      // 2. Validate password
      if (userData.u_password !== pass) {
        return next(new CostemError( 400,"Incorrect password"));
      }
  
      // 3. Validate phone number
      if (userData.u_phone_num !== num) {
        return next(new CostemError( 400,"Phone number does not match"));
      }
  
      // 4. Success – Render dashboard
      const items = await Item.find();
      res.render("./user/index.ejs", { items, userData });
    })
  );

//user info
userRout.get(
  "/:id/info",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let userData = await User.findById(id);
    res.render("./user/userAccountInfo.ejs", { userData });
  })
);

//user details edit<<1>>
userRout.get(
  "/:id/edit",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let userData = await User.findById(id);
    res.render("./user/userEditForm.ejs", { userData });
  })
);

// <<2>>
userRout.put(
  "/:id/edit",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let formData = req.body.u;
    let userData = await User.findByIdAndUpdate(id, { ...formData });
    res.redirect(`/user/${id}/info`);
  })
);

//add cart item for user side
userRout.put(
  "/:userId/:itemId/addcart",
  asyncWrap(async (req, res, next) => {
    let { userId, itemId } = req.params;
    let itemData = await Item.findById(itemId);
    let updata = await User.findById(userId);
    updata.addcart.push(itemData);
    await updata.save();
    res.redirect(`/users/${userId}`);
  })
);

//cart btn pe click karne pr cartItem.ejs page pr laga
userRout.get(
  "/:userId/cart",
  asyncWrap(async (req, res, next) => {
    let { userId } = req.params;
    let userData = await User.findById(userId).populate("addcart");
    res.render("./user/cartItem.ejs", { userData });
  })
);

//delete cart item for user side in cart
userRout.delete(
  "/:userId/cart/:itemId/delete",
  asyncWrap(async (req, res, next) => {
    const { userId, itemId } = req.params;
    const user = await User.findById(userId);
    //ye filter hame naya array daga jaha condition check hogi
    user.addcart = user.addcart.filter((item) => {
      return item._id != itemId;
    });

    await user.save();
    res.redirect(`/users/${userId}`);
  })
);

module.exports = userRout;
