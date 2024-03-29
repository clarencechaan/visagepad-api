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

/* PUT edit comment on post */
router.put("/api/comments/:commentId", comment_controller.comment_put);

/* PUT like comment on post */
router.put(
  "/api/comments/:commentId/like",
  comment_controller.comment_like_put
);

/* PUT unlike comment on post */
router.put(
  "/api/comments/:commentId/unlike",
  comment_controller.comment_unlike_put
);

/* GET specific comment */
router.get("/api/comments/:commentId", comment_controller.comment_get);

// POSTS

/* GET user's posts */
router.get("/api/users/:userId/posts/:page?", post_controller.user_posts_get);

/* POST create post */
router.post("/api/users/:userId/posts", post_controller.user_posts_post);

/* GET requesting user's feed */
router.get("/api/my-feed/:page?", post_controller.feed_get);

/* GET specific post */
router.get("/api/posts/:postId", post_controller.post_get);

/* DELETE specific post */
router.delete("/api/posts/:postId", post_controller.post_delete);

/* PUT like specific post */
router.put("/api/posts/:postId/like", post_controller.post_like_put);

/* PUT unlike specific post */
router.put("/api/posts/:postId/unlike", post_controller.post_unlike_put);

/* PUT edit post */
router.put("/api/posts/:postId", post_controller.user_posts_put);

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

/* GET relationship status of user */
router.get("/api/users/:userId/relationship", user_controller.relationship_get);

/* PUT update user profile picture or cover photo */
router.put("/api/update-photo", user_controller.user_photo_put);

/* GET search users */
router.get("/api/search-users/:query", user_controller.search_users_get);

/* GET people you may know */
router.get("/api/people-may-know", user_controller.people_may_know_get);

module.exports = router;
