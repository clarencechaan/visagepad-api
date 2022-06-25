const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserRelationshipScheme = new Schema({
  relating_user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  related_user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    required: true,
    enum: ["None", "Requesting", "Requestee", "Friends"],
    default: "None",
  },
});

//Export model
module.exports = mongoose.model("UserRelationship", UserRelationshipScheme);
