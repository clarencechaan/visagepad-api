# visagepad-api

Express/Node RESTful API that provides access to the MongoDB database used in the MERN stack social media web application at https://visagepad.onrender.com/ \
React frontend repo can be found at https://github.com/clarencechaan/visagepad-frontend \
Queries to the API can be made by sending the desired HTTP request to [https://visagepad-api.herokuapp.com/](https://visagepad-api.herokuapp.com/)\<query>

| Method |                Endpoint                |                                       Description                                       |                 Required fields                | JSON Web Token (JWT) required |
|:------:|:--------------------------------------:|:---------------------------------------------------------------------------------------:|:----------------------------------------------:|:-----------------------------:|
|   GET  |     /api/users/:userId/posts/:page?    |                          Retrieve a user's posts by page number                         |                        -                       |               ❌               |
|  POST  |        /api/users/:userId/posts        |                                      Create a post                                      |                content, img_url                |               ✅               |
|   GET  |           /api/my-feed/:page?          |                                 Retrieve user's own feed                                |                        -                       |               ✅               |
|   GET  |           /api/posts/:postId           |                                  Retrieve a post by ID                                  |                        -                       |               ❌               |
| DELETE |           /api/posts/:postId           |                                   Delete a post by ID                                   |                        -                       |               ✅               |
|   PUT  |         /api/posts/:postId/like        |                                    Like a post by ID                                    |                        -                       |               ✅               |
|   PUT  |        /api/posts/:postId/unlike       |                                   Unlike a post by ID                                   |                        -                       |               ✅               |
|   PUT  |           /api/posts/:postId           |                                    Edit a post by ID                                    |                content, img_url                |               ✅               |
|   GET  |       /api/posts/:postId/comments      |                             Retrieve the comments on a post                             |                        -                       |               ❌               |
|  POST  |       /api/posts/:postId/comments      |                                Create a comment on a post                               |                     message                    |               ✅               |
| DELETE |        /api/comments/:commentId        |                                  Delete a comment by ID                                 |                        -                       |               ✅               |
|   PUT  |        /api/comments/:commentId        |                                   Edit a comment by ID                                  |                     message                    |               ✅               |
|   PUT  |      /api/comments/:commentId/like     |                                 Like a comment on a post                                |                        -                       |               ✅               |
|   PUT  |     /api/comments/:commentId/unlike    |                                Unlike a comment on a post                               |                        -                       |               ✅               |
|   GET  |        /api/comments/:commentId        |                                 Retrieve a comment by ID                                |                        -                       |               ❌               |
|   GET  |           /api/users/:userId           |                              Retrieve a user's information                              |                        -                       |               ❌               |
|  POST  |               /api/users               |                                  Create a user account                                  | first_name, last_name, username, password, pfp |               ✅               |
|   PUT  |   /api/users/:userId/allow-friendship  |                Allow friendship of a user (send or accept friend request)               |                        -                       |               ✅               |
|   PUT  | /api/users/:userId/disallow-friendship | Disallow friendship of a user (unfriend, deny friend request, or revoke friend request) |                        -                       |               ✅               |
|   GET  |       /api/users/:userId/friends       |                           Retrieve the friends list of a user                           |                        -                       |               ✅               |
|   GET  |       /api/users/:userId/mutuals       |                        Retrieve the mutual friends list of a user                       |                        -                       |               ✅               |
|   GET  |          /api/friend-requests          |                            Retrieve a user's friend requests                            |                        -                       |               ✅               |
|   GET  |     /api/users/:userId/relationship    |    Retrieve the relationship status of a user (None, Requesting, Requestee, Friends)    |                        -                       |               ✅               |
|   PUT  |            /api/update-photo           |                      Update a user's profile picture or cover photo                     |                   pfp, cover                   |               ✅               |
|   GET  |        /api/search-users/:query        |                          Search users by first and/or last name                         |                        -                       |               ❌               |
|   GET  |          /api/people-may-know          |   Retrieve a list of user's a user may know who are not already friends with the user   |                        -                       |               ✅               |
|  POST  |               /auth/login              |                            Retrieve JWT associated with user                            |               username, password               |               ❌               |

Post model: { author, content, date, img_url, likes } \
Comment model: { post, author, message, date, likes } \
User model: { first_name, last_name, username, password, pfp, cover } \
UserRelationship model: { relating_user, related_user, status }
