const express = require("express");
const userRout = express.Router();
const Item = require("../model/index.js");
const User = require("../model/user.js");
const joi = require("joi");
const CostemError = require('../error.js');
const {userSchema,shopkeeperSchema}=require('../schema.js');
const passport = require("passport");
const { isloggen } = require("../middleware.js");

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
  "/createAccountForUser",
  asyncWrap(async (req, res, next) => {
    let { u_name, u_email, u_password, u_phone_num, u_location } = req.body;
    console.log(u_name, u_email,u_password,u_phone_num,u_location);
    let user1 = new User({
      username: u_name,
      u_email: u_email,
      u_phone_num: u_phone_num,
      u_location: u_location,
      u_by_item_list: "none",
    });
    
    let userData=await User.register(user1,u_password)

    req.login(userData,(error)=>{
      if(error){
        return next(error)
      }
      // Set flash message before rendering
      req.flash('success', 'create account successful!');
      res.redirect(`/users/${userData._id}`);
    })
  })
);

//login btn on root <<1>>
userRout.get("/loginform", (req, res) => {
  // console.log(req.isAuthenticated())
  res.render("./loginAndSigin/loginform.ejs");
});

//login <<2>>
userRout.post(
    "/",passport.authenticate('local',{
      failureRedirect:'/user/createAccountForm',
      failureFlash:true,
    }),
    asyncWrap(async (req, res, next) => {
        req.flash('success', 'Login successful!');
        res.redirect(`users/${req.user._id}`)
    })
  );

//user info
userRout.get(
  "/:id/info",
  asyncWrap(async (req, res, next) => {
    let { id } = req.params;
    let userData = await User.findById(id);
    req.flash('success', 'Login successful!');
      // Set flash message before rendering
      req.flash('msg', 'edit successful!');
    res.render("./user/userAccountInfo.ejs", { userData });
  })
);

//user details edit<<1>>
userRout.get(
  "/:id/edit",
  asyncWrap(async (req, res, next) => {
    console.log(req.user)
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


// user logout
userRout.get('/logout',(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      next(err)
    }
      req.flash('success', 'Logout successful!');
      res.redirect(`/`)
  })
})

//add cart item for user side
userRout.put(
  "/:userId/:itemId/addcart",
  asyncWrap(async (req, res, next) => {
    let { userId, itemId } = req.params;
    let itemData = await Item.findById(itemId);
    let updata = await User.findById(userId);
    updata.addcart.push(itemData);
    await updata.save();
    req.flash('success','add item')
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
    req.flash('success','Delete item')
    res.redirect(`/users/${userId}`);
  })
);

userRout.get('/buy',isloggen,(req,res,next)=>{
  
})

module.exports = userRout;
