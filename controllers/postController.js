const Post = require("../models/post");

/* GET user's posts */
exports.user_posts_get = async function (req, res, next) {
  res.json({ message: "GET user's posts" });
};

/* POST create post */
exports.user_posts_post = async function (req, res, next) {
  res.json({ message: "POST create post" });
};

/* GET user's feed */
exports.user_feed_get = async function (req, res, next) {
  res.json({ message: "GET user's feed" });
};

/* GET specific post */
exports.post_get = async function (req, res, next) {
  res.json({ message: "GET specific post" });
};

/* DELETE specific post */
exports.post_delete = async function (req, res, next) {
  res.json({ message: "DELETE specific post" });
};
