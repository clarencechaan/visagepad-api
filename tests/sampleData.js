const bcrypt = require("bcryptjs");
const User = require("../models/user");
const UserRelationship = require("../models/userRelationship");
const Post = require("../models/post");
const Comment = require("../models/comment");
const request = require("supertest");

// sample data

let users = [
  {
    first_name: "Leonard",
    last_name: "Day",
    username: "theapartment",
    plaintext_password: "pass",
    pfp: "https://i.imgur.com/XUlRwHK.png",
    cover: "https://i.imgur.com/NNChuCD.jpeg",
  },
  {
    first_name: "Alex",
    last_name: "Morris",
    username: "chocolatebar",
    plaintext_password: "s3cur3p4$$",
  },
  {
    first_name: "Tom",
    last_name: "Hanks",
    username: "tomhanks",
    plaintext_password: "apples",
  },
  {
    first_name: "Lisa",
    last_name: "Simpson",
    username: "lsimpson",
    plaintext_password: "saxophone",
  },
  {
    first_name: "Harry",
    last_name: "Potter",
    username: "hpotter5",
    plaintext_password: "hogwarts",
  },
  {
    first_name: "Kendrick",
    last_name: "Lamar",
    username: "kdot",
    plaintext_password: "goodkidmaadcity",
  },
  {
    first_name: "Wasalu",
    last_name: "Jaco",
    username: "foodnliquor",
    plaintext_password: "thecool",
  },
];

let relationships = [
  { relating_user: users[0], related_user: users[1], status: "None" },
  { relating_user: users[1], related_user: users[0], status: "None" },
  {
    relating_user: users[0],
    related_user: users[2],
    status: "Requesting",
  },
  {
    relating_user: users[2],
    related_user: users[0],
    status: "Requestee",
  },
  {
    relating_user: users[0],
    related_user: users[3],
    status: "Requestee",
  },
  {
    relating_user: users[3],
    related_user: users[0],
    status: "Requesting",
  },
  {
    relating_user: users[0],
    related_user: users[4],
    status: "Friends",
  },
  {
    relating_user: users[4],
    related_user: users[0],
    status: "Friends",
  },
  {
    relating_user: users[2],
    related_user: users[4],
    status: "Friends",
  },
  {
    relating_user: users[4],
    related_user: users[2],
    status: "Friends",
  },
  {
    relating_user: users[3],
    related_user: users[4],
    status: "Friends",
  },
  {
    relating_user: users[4],
    related_user: users[3],
    status: "Friends",
  },
  {
    relating_user: users[5],
    related_user: users[2],
    status: "Friends",
  },
  {
    relating_user: users[2],
    related_user: users[5],
    status: "Friends",
  },
  {
    relating_user: users[5],
    related_user: users[3],
    status: "Friends",
  },
  {
    relating_user: users[3],
    related_user: users[5],
    status: "Friends",
  },
  {
    relating_user: users[5],
    related_user: users[0],
    status: "Requesting",
  },
  {
    relating_user: users[0],
    related_user: users[5],
    status: "Requestee",
  },
];

let posts = [
  {
    author: users[0],
    content:
      "Both sympathize suitable melancholy thirty maids event balls besides company while conveying windows frankness family off suffering. Each  debating subjects fortune friendly above chiefly maids. Meet missed replying recurred size her then. Four cease abilities call own looking stand letters uncommonly. Made repulsive green merits its handsome rose blushes are songs tolerably burst bore home denote.",
    date: Date.now() - 1000 * 60 * 60 * 24 * 4,
    img_url: "https://i.imgur.com/2NqtASX.jpg",
    likes: [],
  },
  {
    author: users[0],
    content:
      "Cordially played unpacked children resources half direction marry neat add inquiry life soon above did esteems pronounce. Quit highly arrived adieus civility material address married entrance enable. Sold attention late believed decay surrounded inhabit either. Repair pleasure turned fulfilled fruit arranging more whatever mirth means furniture friend affixed proposal then wondered consisted. Cease especially were even match decay handsome plan allowance strongly behaviour situation esteem diminution feeling such feet.",
    date: Date.now() - 1000 * 60 * 60 * 24,
    img_url: "",
    likes: [users[1], users[2]],
  },
  {
    author: users[2],
    content:
      "Total are become alteration only believed consisted ten manners party ashamed. Formerly prevent thrown any merits are denote prospect adieus afraid too chief exquisite perfectly. Noise they perfectly sight reasonably way worth likewise confined waiting dinner do settling played disposed esteems produced. Ask eagerness produce smallest contrasted. Met inhabiting shade marriage drawn acuteness ﻿no supposing downs sake then place partiality mrs followed rapid unsatiable. ",
    date: Date.now(),
    img_url: "https://i.imgur.com/RAiEIvK.jpg",
    likes: [users[4]],
  },
  {
    author: users[1],
    content:
      "Reasonable knew cultivated unwilling unpleasing repair going rather began unable within play inquietude county. Sympathize polite make esteem whole common perceived attending small. Expect own guest exposed met. Sing down wrote music mistake child increasing left shutters parties. Valley extent quitting stuff. ",
    date: Date.now() - 1000 * 60 * 60 * 24 * 6,
    img_url: "",
    likes: [users[0], users[2], users[3]],
  },
  {
    author: users[4],
    content:
      "Greatest boisterous form doubtful basket door. Shall shewing extensive highest like point then acceptance distrusts welcomed greatly going satisfied blind expect repeated that. Families wrong seen remark mr painful justice engrossed whether piqued perceive outlived settle share means remaining. Again northward advantage afraid effect kept be relied feebly precaution tastes preferred scarcely admire theirs compliment mean. Will several far gay. ",
    date: Date.now() - 1000 * 60 * 60 * 24 * 2,
    img_url: "https://i.imgur.com/6KEnnGF.jpg",
    likes: [users[2]],
  },
];

let comments = [
  {
    post: posts[0],
    author: users[1],
    message:
      "Deal speaking have morning consulted admitting matters manners desirous minutes add doubt furniture.",
    date: posts[0].date + 1000 * 60 * 120,
  },
  {
    post: posts[0],
    author: users[0],
    message:
      "Pulled pulled old known forth money rapid entrance discourse trees.",
    date: posts[0].date + 1000 * 60 * 38,
    likes: [users[1]],
  },
  {
    post: posts[1],
    author: users[2],
    message: "Bore distrusts tastes thing might extended five.",
    date: posts[1].date + 1000 * 60 * 60 * 3,
  },
];

// populate the database with the sample data
async function populateDb() {
  // save users and set _id
  for (const user of users) {
    // hash password
    user.password = await bcrypt.hash(user.plaintext_password, 10);

    user._id = (await new User(user).save())._id;
  }

  // save user relationships and set _id
  for (const userRelationship of relationships) {
    userRelationship._id = (
      await new UserRelationship(userRelationship).save()
    )._id;
  }

  // save posts and set _id
  for (const post of posts) {
    post._id = (await new Post(post).save())._id;
  }

  // save comments and set _id
  for (const comment of comments) {
    comment._id = (await new Comment(comment).save())._id;
  }
}

// set token property of each user
async function setTokens(app) {
  for (const user of users) {
    // set user token
    user.token = (
      await request(app)
        .post("/auth/login")
        .type("form")
        .send({ username: user.username, password: user.plaintext_password })
    ).body.token;
  }
}

module.exports = {
  users,
  relationships,
  posts,
  comments,
  populateDb,
  setTokens,
};
