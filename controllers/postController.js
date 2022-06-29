const Post = require("../models/post");
const passport = require("passport");

/* GET user's posts (sorted by date descending) */
// input: params.userId
// output: [{ author, content, date, img_url, likes }, ...]
exports.user_posts_get = async function (req, res, next) {
  try {
    const posts = await Post.find({ author: req.params.userId });
    res.json(posts);
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};

/* POST create post */
// input: req.user, content, (img_url)
// output: { postId }
exports.user_posts_post = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      res.json({ msg: "hello" });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET requesting user's feed (sorted by date descending) */
// input: req.user
// output: [{ author, content, date, img_url, likes }, ...]
exports.feed_get = async function (req, res, next) {
  res.json({ msg: "GET requesting user's feed" });
};

/* GET specific post */
// input: params.postId
// output: { author, content, date, img_url, likes }
exports.post_get = async function (req, res, next) {
  res.json({ msg: "GET specific post" });
};

/* DELETE specific post */
// input: req.user, params.postId
// output: { msg }
exports.post_delete = async function (req, res, next) {
  res.json({ msg: "DELETE specific post" });
};

/* PUT toggle like specific post */
// input: req.user, params.postId
// output: { msg }
exports.post_like_put = async function (req, res, next) {
  res.json({ msg: "PUT like specific post" });
};
