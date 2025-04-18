const mongoose = require("mongoose");
const { Schema } = mongoose;
const passpostLocalMongoose=require('passport-local-mongoose')

const userSchema = new Schema({
  u_email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/\S+@\S+\.\S+/, "Please provide a valid email"]
  },
  u_phone_num: {
    type: String,
    required: [true, "Phone number is required"],
    match: [/^\d{10}$/, "Phone number must be 10 digits"]
  },
  u_location: {
    type: String,
    required: [true, "Location is required"]
  },
  u_by_item_list: {
    type: String,
    default: "none"
  },
  order: [
    {
      type: Schema.Types.ObjectId,
      ref: 'item'
    }
  ],
  addcart: [
    {
      type: Schema.Types.ObjectId,
      ref: 'item'
    }
  ]
}, {
  timestamps: true
});

userSchema.plugin(passpostLocalMongoose)

module.exports = mongoose.model("user", userSchema);
