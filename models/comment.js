const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  likes: [
    { type: Schema.Types.ObjectId, ref: "User", default: [], required: true },
  ],
});

//Export model
module.exports = mongoose.model("Comment", CommentSchema);
