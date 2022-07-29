const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  pfp: { type: String },
  cover: { type: String },
});

UserSchema.index({ first_name: "text", last_name: "text" });

//Export model
module.exports = mongoose.model("User", UserSchema);
