const Comment = require("../models/comment");

/* GET post's comments (date ascending order) */
// input: params.postId
// output: [{ author, message, date }, ...]
exports.post_comments_get = async function (req, res, next) {
  try {
    const comments = await Comment.find({ post: req.params.postId }).sort({
      date: 1,
    });
    res.json(comments);
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};

/* POST create comment on post */
// input: params.postId, { author, message }
// output: { commentId }
exports.comment_post = async function (req, res, next) {
  res.json({ msg: "POST create comment on post" });
};

/* DELETE specific comment */
// input: { commentId }
// output: { msg }
exports.comment_delete = async function (req, res, next) {
  res.json({ msg: "DELETE specific comment" });
};
