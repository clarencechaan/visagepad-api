// USAGE:
// node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.jrqcl.mongodb.net/VPDB?retryWrites=true"

// Get arguments passed on command line
var mongoDB = process.argv.slice(2)[0];

var async = require("async");
var bcrypt = require("bcryptjs");
require("dotenv").config();
var fs = require("fs");
var User = require("../models/user");
var Post = require("../models/post");
var Comment = require("../models/comment");
var UserRelationship = require("../models/userRelationship");

var mongoose = require("mongoose");
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const nameBank = fs.readFileSync("./names.txt", "utf8").split(" ");
const usernameBank = fs.readFileSync("./usernames.txt", "utf8").split(" ");
const linkBank = fs.readFileSync("./links.txt", "utf8").split(" ");
const wordBank = fs.readFileSync("./words.txt", "utf8").split(" ");

const numOfUsers = 100;

var users = [];
var posts = [];
var comments = [];
var userRelationships = [];

function userCreate(first_name, last_name, username, password, pfp, cover, cb) {
  var user = new User({
    first_name,
    last_name,
    username,
    password,
    pfp,
    cover,
  });

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return next(err);
    }
    user.password = hashedPassword;
    user.save(function (err) {
      if (err) {
        return cb(err, null);
      }
      console.log("New User: " + user);
      users.push(user);
      cb(null, user);
    });
  });
}

function postCreate(author, content, date, img_url, likes, cb) {
  var post = new Post({
    author,
    content,
    date,
    img_url,
    likes,
  });

  post.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Post: " + post);
    posts.push(post);
    cb(null, post);
  });
}

function commentCreate(post, author, message, date, likes, cb) {
  var comment = new Comment({
    post,
    author,
    message,
    date,
    likes,
  });

  comment.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Comment: " + comment);
    comments.push(comment);
    cb(null, comment);
  });
}

function userRelationshipCreate(relating_user, related_user, status, cb) {
  var userRelationship = new UserRelationship({
    relating_user,
    related_user,
    status,
  });

  userRelationship.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New UserRelationship: " + userRelationship);
    userRelationships.push(userRelationship);
    cb(null, userRelationship);
  });
}

function createUsers(cb) {
  let fns = [];

  for (let i = 0; i < numOfUsers; i++) {
    const first_name = nameBank[Math.floor(Math.random() * 1000)];
    const last_name = nameBank[Math.floor(Math.random() * 1000)];
    const username = usernameBank[i];
    const password = "pass";
    const pfp = linkBank[Math.floor(Math.random() * 1575)];
    const cover = linkBank[Math.floor(Math.random() * 1575)];

    fns.push(function (callback) {
      userCreate(
        first_name,
        last_name,
        username,
        password,
        pfp,
        cover,
        callback
      );
    });
  }

  async.parallel(
    fns,
    // optional callback
    cb
  );
}

function createPosts(cb) {
  let fns = [];

  // author
  for (const user of users) {
    const numOfPosts = Math.floor(Math.random() * 11);

    for (let i = 0; i < numOfPosts; i++) {
      // content
      let content = [];
      let charCount = 0;
      const numOfWords = Math.floor(Math.random() * 101) + 1;

      for (let i = 0; i < numOfWords; i++) {
        const idx = Math.floor(Math.random() * 3000);
        if (charCount + wordBank[idx].length <= 1500) {
          content.push(wordBank[idx]);
          charCount += wordBank[idx].length;
        } else {
          break;
        }
      }

      content[0] = content[0].charAt(0).toUpperCase() + content[0].slice(1);
      content[content.length - 1] = content[content.length - 1] + ".";
      content = content.join(" ");

      // date
      const timeAgo = Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7 * 12);
      const date = Date.now() - timeAgo;

      // img_url
      const imgIdx = Math.floor(Math.random() * 1575);
      const img_url = Math.random() < 0.5 ? linkBank[imgIdx] : "";

      // likes
      let likes = [];
      const numOfLikes = Math.floor(Math.random() * 26);
      for (let i = 0; i < numOfLikes; i++) {
        const idx = Math.floor(Math.random() * numOfUsers);
        if (!likes.includes(users[idx])) {
          likes.push(users[idx]);
        }
      }

      // postCreate function
      fns.push(function (callback) {
        postCreate(user, content, date, img_url, likes, callback);
      });
    }
  }

  async.parallel(
    fns,
    // optional callback
    cb
  );
}

function createComments(cb) {
  let fns = [];

  // post
  for (const post of posts) {
    const commentCount = Math.floor(Math.random() * 8);

    for (let i = 0; i < commentCount; i++) {
      // author
      const authorIdx = Math.floor(Math.random() * numOfUsers);
      const author = users[authorIdx];

      // message
      const numOfWords = Math.floor(Math.random() * 26) + 1;
      let message = [];
      let charCount = 0;

      for (let i = 0; i < numOfWords; i++) {
        const idx = Math.floor(Math.random() * 3000);
        if (charCount + wordBank[idx].length <= 1500) {
          message.push(wordBank[idx]);
          charCount += wordBank[idx].length;
        } else {
          break;
        }
      }

      message[0] = message[0].charAt(0).toUpperCase() + message[0].slice(1);
      message[message.length - 1] = message[message.length - 1] + ".";
      message = message.join(" ");

      // date
      const postDate = new Date(post.date);
      const timeSincePost = Date.now() - postDate;
      const date =
        postDate.getTime() + Math.floor(Math.random() * timeSincePost);

      // likes
      let likes = [];
      const numOfLikes =
        Math.random() < 0.5 ? Math.floor(Math.random() * 11) : 0;
      for (let i = 0; i < numOfLikes; i++) {
        const idx = Math.floor(Math.random() * numOfUsers);
        if (!likes.includes(users[idx])) {
          likes.push(users[idx]);
        }
      }

      // commentCreate function
      fns.push(function (callback) {
        commentCreate(post, author, message, date, likes, callback);
      });
    }
  }

  async.parallel(
    fns,
    // optional callback
    cb
  );
}

function createUserRelationships(cb) {
  let fns = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const userA = users[i];
      const userB = users[j];
      const randNum = Math.random();
      let status = "None";

      if (randNum < 0.3) {
        status = "Friends";
      } else if (randNum < 0.4) {
        status = "Requesting";
      } else if (randNum < 0.5) {
        status = "Requestee";
      }

      if (status === "Friends") {
        fns.push(function (callback) {
          userRelationshipCreate(userA, userB, "Friends", callback);
        });
        fns.push(function (callback) {
          userRelationshipCreate(userB, userA, "Friends", callback);
        });
      } else if (status === "Requesting") {
        fns.push(function (callback) {
          userRelationshipCreate(userA, userB, "Requesting", callback);
        });
        fns.push(function (callback) {
          userRelationshipCreate(userB, userA, "Requestee", callback);
        });
      } else if (status === "Requestee") {
        fns.push(function (callback) {
          userRelationshipCreate(userA, userB, "Requestee", callback);
        });
        fns.push(function (callback) {
          userRelationshipCreate(userB, userA, "Requesting", callback);
        });
      }
    }
  }

  async.parallel(
    fns,
    // optional callback
    cb
  );
}

async function populate() {
  await db.dropCollection("comments");
  await db.dropCollection("posts");
  await db.dropCollection("userrelationships");
  await db.dropCollection("users");

  await db.createCollection("comments");
  await db.createCollection("posts");
  await db.createCollection("userrelationships");
  await db.createCollection("users");

  async.series(
    [createUsers, createPosts, createComments, createUserRelationships],
    // Optional callback
    function (err, results) {
      if (err) {
        console.log("FINAL ERR: " + err);
      }
      // All done, disconnect from database
      mongoose.connection.close();
    }
  );
}

populate();
