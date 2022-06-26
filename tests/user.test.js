const User = require("../models/user");
const UserRelationship = require("../models/userRelationship");
const bcrypt = require("bcryptjs");
require("../passport");

const index = require("../routes/index");
const auth = require("../routes/auth");
const mongoTesting = require("../mongoConfigTesting");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", index);
app.use("/auth", auth);

let users = [
  {
    first_name: "Leonard",
    last_name: "Day",
    username: "theapartment",
    plaintext_password: "pass",
    pfp: "https://i.imgur.com/XUlRwHK.png",
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
];

let relationships = [
  { relating_user: users[0], related_user: users[1], status: "None" },
  { relating_user: users[1], related_user: users[0], status: "None" },
  {
    relating_user: users[0],
    related_user: users[2],
    status: "Requestee",
  },
  {
    relating_user: users[2],
    related_user: users[0],
    status: "Requesting",
  },
  {
    relating_user: users[0],
    related_user: users[3],
    status: "Friends",
  },
  {
    relating_user: users[3],
    related_user: users[0],
    status: "Friends",
  },
  {
    relating_user: users[1],
    related_user: users[2],
    status: "Requestee",
  },
  {
    relating_user: users[2],
    related_user: users[1],
    status: "Requesting",
  },
  {
    relating_user: users[1],
    related_user: users[3],
    status: "Requesting",
  },
  {
    relating_user: users[3],
    related_user: users[1],
    status: "Requestee",
  },
];

beforeAll(async () => {
  await mongoTesting.initializeMongoServer();

  for (const user of users) {
    // hash password
    user.password = await bcrypt.hash(user.plaintext_password, 10);

    // save user and set id
    user._id = (await new User(user).save())._id.toString();

    // set user token
    user.token = (
      await request(app)
        .post("/auth/login")
        .type("form")
        .send({ username: user.username, password: user.plaintext_password })
    ).body.token;
  }

  // save user relationships to database, then get and set _id
  for (const userRelationship of relationships) {
    userRelationship.relating_user = userRelationship.relating_user._id;
    userRelationship.related_user = userRelationship.related_user._id;
    userRelationship._id = (
      await new UserRelationship(userRelationship).save()
    )._id.toString();
  }
});

afterAll(async () => {
  await mongoTesting.closeMongoServer();
});

test("GET specific user works", async () => {
  // send GET request with userId parameter
  const response = await request(app).get("/api/users/" + users[1]._id);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body.username).toEqual(users[1].username);
  expect(response.body.password).toEqual(users[1].password);
  expect(response.body.first_name).toEqual(users[1].first_name);
  expect(response.body.last_name).toEqual(users[1].last_name);
});

test("POST create user works", async () => {
  // send POST request containing a new user
  const user = {
    first_name: "Homer",
    last_name: "Simpson",
    username: "hojo742",
    password: "donuts",
    pfp: "https://i.imgur.com/8poRNOu.jpg",
  };

  const response = await request(app)
    .post("/api/users")
    .type("form")
    .send(user);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);

  // check returned userId is a MongoDB ObjectID
  expect(response.body.userId.match(/^[0-9a-fA-F]{24}$/)).toBeTruthy();

  // check user is in database
  const userId = response.body.userId;
  const dbUser = await User.findById(userId);
  expect(dbUser.first_name).toEqual(user.first_name);
  expect(dbUser.last_name).toEqual(user.last_name);
  expect(dbUser.username).toEqual(user.username);
  expect(dbUser.pfp).toEqual(user.pfp);

  // check password is hashed and matches
  expect(await bcrypt.compare(user.password, dbUser.password)).toBeTruthy();
});

test("POST allow friendship (send friend request) works", async () => {
  // send allow friendship POST request for 2 users who are not friends
  const response = await request(app)
    .post(`/api/users/${users[1]._id}/allow-friendship`)
    .set("Authorization", "Bearer " + users[0].token);

  console.log(response.body);
});

test("POST allow friendship (accept friend request) works", async () => {});

test("POST disallow friendship (unfriend) works", async () => {});

test("POST disallow friendship (deny friend request) works", async () => {});

test("POST disallow friendship (revoke friend request) works", async () => {});
