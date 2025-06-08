const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let schema = new mongoose.Schema({
  i_img: {
    type: String,
  },
  i_name: {
    type: String,
  },
  i_price: {
    type: Number,
    default: 0,
  },
  i_globle_name: {
    type: String,
  },
  i_brand_name: {
    type: String,
  },
  description: {
    type: String,
  },
  shopkeeperId: {
    type: Schema.Types.ObjectId,
    ref: "shopkeeper",
    required: true,
  },
});
let item = mongoose.model("item", schema);
module.exports = item;
