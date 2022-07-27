const Post = require("../models/post");
const UserRelationship = require("../models/userRelationship");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

/* GET user's posts (sorted by date descending) */
// input: params.userId, req.params.page
// output: [{ author, content, date, img_url, likes }, ...]
exports.user_posts_get = async function (req, res, next) {
  const pageNumber = req.params.page;

  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({
        date: -1,
      })
      .skip(pageNumber > 0 ? (pageNumber - 1) * 3 : 0)
      .limit(pageNumber > 0 ? 3 : 0)
      .populate("author likes");
    res.json(posts);
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};

/* POST create post */
// input: req.user, { content, (img_url) }
// output: { postId }
exports.user_posts_post = [
  passport.authenticate("jwt", { session: false }),
  body("content", "Content must be between 1 and 1500 characters.")
    .trim()
    .isLength({ min: 1, max: 1500 })
    .escape(),
  body("img_url", "Image URL must be a URL.").optional().isURL(),
  async function (req, res, next) {
    const errors = validationResult(req);
    const { content, img_url } = req.body;

    try {
      // throw error if validation errors exist
      if (!errors.isEmpty()) {
        throw errors.array();
      }

      const post = {
        author: req.user._id,
        content,
        date: Date.now(),
        img_url,
        likes: [],
      };

      const postId = (await new Post(post).save())._id;

      res.json({ postId });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET requesting user's feed (sorted by date descending) */
// input: req.user, req.params.page
// output: [{ author, content, date, img_url, likes }, ...]
exports.feed_get = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    const pageNumber = req.params.page;

    try {
      // get friends list
      const relationships = await UserRelationship.find({
        relating_user: req.user._id,
        status: "Friends",
      });
      const friends = relationships.map(
        (relationship) => relationship.related_user
      );

      // get posts of each friend
      const posts = friends.length
        ? await Post.find({
            $or: [
              { author: req.user._id },
              ...friends.map((friend) => ({ author: friend })),
            ],
          })
            .sort({ date: -1 })
            .skip(pageNumber > 0 ? (pageNumber - 1) * 3 : 0)
            .limit(pageNumber > 0 ? 3 : 0)
            .populate("author likes")
        : [];
      res.json(posts);
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET specific post */
// input: params.postId
// output: { author, content, date, img_url, likes }
exports.post_get = async function (req, res, next) {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    res.json(post);
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};

/* DELETE specific post */
// input: req.user, params.postId
// output: { msg }
exports.post_delete = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const postId = req.params.postId;
      const post = await Post.findById(postId);
      if (post.author.equals(req.user._id)) {
        await Post.findByIdAndDelete(postId);
        res.json({ msg: "Post successfully deleted." });
      } else {
        res.json({ msg: "You are not authorized to delete this post." });
      }
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* PUT like specific post */
// input: req.user, params.postId
// output: { msg }
exports.post_like_put = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      await Post.findByIdAndUpdate(req.params.postId, {
        $addToSet: { likes: req.user._id },
      });
      res.json({ msg: "Post successfully liked." });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* PUT unlike specific post */
// input: req.user, params.postId
// output: { msg }
exports.post_unlike_put = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      await Post.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: req.user._id },
      });
      res.json({ msg: "Post successfully unliked." });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];
