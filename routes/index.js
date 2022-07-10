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
router.delete("/api/comments/:commentId", comment_controller.comment_delete);

// POSTS

/* GET user's posts */
router.get("/api/users/:userId/posts", post_controller.user_posts_get);

/* POST create post */
router.post("/api/users/:userId/posts", post_controller.user_posts_post);

/* GET requesting user's feed */
router.get("/api/my-feed", post_controller.feed_get);

/* GET specific post */
router.get("/api/posts/:postId", post_controller.post_get);

/* DELETE specific post */
router.delete("/api/posts/:postId", post_controller.post_delete);

/* PUT toggle like specific post */
router.put("/api/posts/:postId/like", post_controller.post_like_put);

// USERS

/* GET specific user */
router.get("/api/users/:userId", user_controller.user_get);

/* POST create user */
router.post("/api/users", user_controller.user_post);

/* PUT allow friendship (send or accept friend request) */
router.put(
  "/api/users/:userId/allow-friendship",
  user_controller.allow_user_friendship_put
);

/* PUT disallow friendship (unfriend, deny friend request or revoke friend request) */
router.put(
  "/api/users/:userId/disallow-friendship",
  user_controller.disallow_user_friendship_put
);

/* GET friends list */
router.get("/api/users/:userId/friends", user_controller.friends_get);

/* GET mutual friends */
router.get("/api/users/:userId/mutuals", user_controller.mutuals_get);

/* GET friend requests */
router.get("/api/friend-requests", user_controller.friend_requests_get);

module.exports = router;
