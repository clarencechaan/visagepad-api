const User = require("../models/user");
const bcrypt = require("bcryptjs");

const index = require("../routes/index");
const mongoTesting = require("../mongoConfigTesting");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", index);

let users = [
  {
    first_name: "Leonard",
    last_name: "Day",
    username: "theapartment",
    password: "pass",
    pfp: "https://i.imgur.com/XUlRwHK.png",
  },
  {
    first_name: "Alex",
    last_name: "Morris",
    username: "chocolatebar",
    password: "s3cur3p4$$",
  },
];

beforeAll(async () => {
  await mongoTesting.initializeMongoServer();

  // save users to database, then get and set _id
  users[0]._id = (await new User(users[0]).save())._id.toString();
  users[1]._id = (await new User(users[1]).save())._id.toString();
});

afterAll(async () => {
  await mongoTesting.closeMongoServer();
});

test("GET specific user works", async () => {
  // send GET request with userId parameter
  const response = await request(app).get("/api/users/" + users[1]._id);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body).toEqual(expect.objectContaining(users[1]));
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

test("POST allow friendship (send friend request) works", async () => {});

test("POST allow friendship (accept friend request) works", async () => {});

test("POST disallow friendship (unfriend) works", async () => {});

test("POST disallow friendship (deny friend request) works", async () => {});

test("POST disallow friendship (revoke friend request) works", async () => {});
