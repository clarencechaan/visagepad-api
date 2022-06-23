const Post = require("../models/post");

/* GET user's posts */
// input: param.userId
// output: [ { author, content, date, img_url, likes }, ... ]
exports.user_posts_get = async function (req, res, next) {
  res.json({ message: "GET user's posts" });
};

/* POST create post */
// input: user, body.content, (body.img_url)
// output: { postId }
exports.user_posts_post = async function (req, res, next) {
  res.json({ message: "POST create post" });
};

/* GET user's feed */
// input: param.userId
// output: [ { author, content, date, img_url, likes }, ... ]
exports.user_feed_get = async function (req, res, next) {
  res.json({ message: "GET user's feed" });
};

/* GET specific post */
// input: param.postId
// output: { author, content, date, img_url, likes }
exports.post_get = async function (req, res, next) {
  res.json({ message: "GET specific post" });
};

/* DELETE specific post */
// input: param.postId
// output: { message }
exports.post_delete = async function (req, res, next) {
  res.json({ message: "DELETE specific post" });
};
