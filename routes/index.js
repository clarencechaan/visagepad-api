const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");
const user_controller = require("../controllers/userController");

var express = require("express");
var router = express.Router();

// COMMENTS

/* GET post's comments */
router.get("/api/posts/:postId/comments", comment_controller.post_comments_get);

/* POST create comment on post */
router.post("/api/posts/:postId/comments", comment_controller.comment_post);

/* DELETE specific comment */
router.delete(
  "/api/posts/:postId/comments/:commentId",
  comment_controller.comment_delete
);

// POSTS

/* GET user's posts */
router.get("/api/users/:userId/posts", post_controller.user_posts_get);

/* POST create post */
router.post("/api/users/:userId/posts", post_controller.user_posts_post);

/* GET user's feed */
router.get("/api/users/:userId/feed", post_controller.user_feed_get);

/* GET specific post */
router.get("/api/posts/:postId", post_controller.post_get);

// USERS

/* GET specific user */
router.get("/api/users/:userId", user_controller.user_get);

/* POST create user */
router.post("/api/users", user_controller.user_post);

/* POST allow friendship (send or accept friend request) */
router.post(
  "/api/users/:userId/allow-friendship",
  user_controller.allow_user_friendship_post
);

/* POST disallow friendship (unfriend, deny friend request or revoke friend request) */
router.post(
  "/api/users/:userId/disallow-friendship",
  user_controller.disallow_user_friendship_post
);

module.exports = router;
