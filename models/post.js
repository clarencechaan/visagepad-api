const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  img_url: { type: String },
  likes: [
    { type: Schema.Types.ObjectId, ref: "User", default: [], required: true },
  ],
});

//Export model
module.exports = mongoose.model("Post", PostSchema);
