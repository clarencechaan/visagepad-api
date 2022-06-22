const Comment = require("../models/comment");

/* GET post's comments */
exports.post_comments_get = async function (req, res, next) {
  res.json({ message: "GET post's comments" });
};

/* POST create comment on post */
exports.comment_post = async function (req, res, next) {
  res.json({ message: "POST create comment on post" });
};

/* DELETE specific comment */
exports.comment_delete = async function (req, res, next) {
  res.json({ message: "DELETE specific comment" });
};
