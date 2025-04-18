const mongoose = require("mongoose");
const Schema=mongoose.Schema;

let shopkeeperSchema = new Schema({
  s_name: {
    type: String,
  },
  s_email: {
    type: String,
    unique: true,
  },
  s_password: {
    type: String,
  },
});

let shopKeeper = mongoose.model("shopkeeper", shopkeeperSchema);
module.exports = shopKeeper;
