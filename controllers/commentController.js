const Comment = require("../models/comment");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

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
// input: params.postId, req.user, { message }
// output: { commentId }
exports.comment_post = [
  passport.authenticate("jwt", { session: false }),
  body("message", "Message must be between 1 and 1500 characters.")
    .trim()
    .isLength({ min: 1, max: 1500 })
    .escape(),
  async function (req, res, next) {
    const errors = validationResult(req);

    try {
      // throw error if validation errors exist
      if (!errors.isEmpty()) {
        throw errors.array();
      }

      const commentId = (
        await new Comment({
          post: req.params.postId,
          author: req.user._id,
          message: req.body.message,
          date: Date.now(),
        }).save()
      )._id;
      res.json({ commentId });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* DELETE specific comment */
// input: { commentId }
// output: { msg }
exports.comment_delete = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const commentId = req.params.commentId;
      const comment = await Comment.findById(commentId);
      if (comment.author.equals(req.user._id)) {
        await Comment.findByIdAndDelete(commentId);
        res.json({ msg: "Comment successfully deleted." });
      } else {
        res.json({ msg: "You are not authorized to delete this comment." });
      }
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* PUT edit comment on post */
// input: params.commentId, req.user, { message }
// output: { msg }
exports.comment_put = [
  passport.authenticate("jwt", { session: false }),
  body("message", "Message must be between 1 and 1500 characters.")
    .trim()
    .isLength({ min: 1, max: 1500 })
    .escape(),
  async function (req, res, next) {
    const errors = validationResult(req);

    try {
      // throw error if validation errors exist
      if (!errors.isEmpty()) {
        throw errors.array();
      }

      const commentId = req.params.commentId;
      const comment = await Comment.findById(commentId);
      if (comment.author.equals(req.user._id)) {
        await Comment.findByIdAndUpdate(commentId, {
          message: req.body.message,
        });
        res.json({ msg: "Comment successfully edited." });
      } else {
        res.json({ msg: "You are not authorized to edit this comment." });
      }
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* PUT toggle like on comment */
// input: params.commentId, req.user, { like }
// output: { msg }
exports.comment_like_put = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      if (req.body.like === "true") {
        await Comment.findByIdAndUpdate(req.params.commentId, {
          $addToSet: { likes: req.user._id },
        });
        res.json({ msg: "Comment successfully liked." });
      } else {
        await Comment.findByIdAndUpdate(req.params.commentId, {
          $pull: { likes: req.user._id },
        });
        res.json({ msg: "Comment successfully unliked." });
      }
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];
