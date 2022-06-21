var express = require("express");
var router = express.Router();

// POSTS

/* GET user's posts */
router.get("/api/:userId/posts", post_controller.user_posts_get);

/* GET user's feed */
router.get("/api/:userId/feed", post_controller.user_feed_get);

/* GET specific post */
router.get("/api/posts/:postId", post_controller.post_get);

// COMMENTS

/* GET all comments on post */
router.get("/api/posts/:postId/comments", comment_controller.post_comments_get);

module.exports = router;
