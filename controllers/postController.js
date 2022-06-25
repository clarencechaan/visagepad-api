const Post = require("../models/post");

/* GET user's posts */
// input: params.userId
// output: [{ author, content, date, img_url, likes }, ...]
exports.user_posts_get = async function (req, res, next) {
  res.json({ msg: "GET user's posts" });
};

/* POST create post */
// input: req.user, content, (img_url)
// output: { postId }
exports.user_posts_post = async function (req, res, next) {
  res.json({ msg: "POST create post" });
};

/* GET user's feed */
// input: params.userId
// output: [{ author, content, date, img_url, likes }, ...]
exports.user_feed_get = async function (req, res, next) {
  res.json({ msg: "GET user's feed" });
};

/* GET specific post */
// input: params.postId
// output: { author, content, date, img_url, likes }
exports.post_get = async function (req, res, next) {
  res.json({ msg: "GET specific post" });
};

/* DELETE specific post */
// input: params.postId
// output: { msg }
exports.post_delete = async function (req, res, next) {
  res.json({ msg: "DELETE specific post" });
};
