const mongoose = require("mongoose");

let schema = new mongoose.Schema({
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

let shopKeeper = mongoose.model("shopkeeper", schema);
module.exports = shopKeeper;
