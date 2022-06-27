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
  {
    first_name: "Harry",
    last_name: "Potter",
    username: "hpotter5",
    plaintext_password: "hogwarts",
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
    status: "Requesting",
  },
  {
    relating_user: users[3],
    related_user: users[0],
    status: "Requestee",
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
    relating_user: users[1],
    related_user: users[2],
    status: "Friends",
  },
  {
    relating_user: users[2],
    related_user: users[1],
    status: "Friends",
  },
  {
    relating_user: users[1],
    related_user: users[3],
    status: "Requestee",
  },
  {
    relating_user: users[3],
    related_user: users[1],
    status: "Requesting",
  },
  {
    relating_user: users[1],
    related_user: users[4],
    status: "Requesting",
  },
  {
    relating_user: users[4],
    related_user: users[1],
    status: "Requestee",
  },
  {
    relating_user: users[2],
    related_user: users[3],
    status: "None",
  },
  {
    relating_user: users[3],
    related_user: users[2],
    status: "None",
  },
];

async function populateDb() {
  for (const user of users) {
    // hash password
    user.password = await bcrypt.hash(user.plaintext_password, 10);

    // save user to database and set id
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
}

beforeAll(async () => {
  await mongoTesting.initializeMongoServer();
  await populateDb();
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

describe("POST allow friendship works", () => {
  test("2 users who are not friends (send friend request)", async () => {
    const resNotFriends = await request(app)
      .post(`/api/users/${users[1]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resNotFriends.status).toEqual(200);
    expect(resNotFriends.headers["content-type"]).toMatch(/json/);
    expect(resNotFriends.body).toEqual({ msg: "Friend request sent." });

    // check user relationship is saved to database
    const relationshipA = await UserRelationship.findOne({
      relating_user: users[0]._id,
      related_user: users[1]._id,
    });
    const relationshipB = await UserRelationship.findOne({
      relating_user: users[1]._id,
      related_user: users[0]._id,
    });
    expect(relationshipA.status).toEqual("Requesting");
    expect(relationshipB.status).toEqual("Requestee");
  });

  test("user who has been sent a friend request by the other (accept friend request)", async () => {
    const resRequestee = await request(app)
      .post(`/api/users/${users[2]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resRequestee.status).toEqual(200);
    expect(resRequestee.headers["content-type"]).toMatch(/json/);
    expect(resRequestee.body).toEqual({ msg: "Accepted friend request." });

    // check user relationship is saved to database
    const relationshipA = await UserRelationship.findOne({
      relating_user: users[0]._id,
      related_user: users[2]._id,
    });
    const relationshipB = await UserRelationship.findOne({
      relating_user: users[2]._id,
      related_user: users[0]._id,
    });
    expect(relationshipA.status).toEqual("Friends");
    expect(relationshipB.status).toEqual("Friends");
  });

  test("user who has already sent a friend request to the other (no action)", async () => {
    const resRequesting = await request(app)
      .post(`/api/users/${users[3]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resRequesting.status).toEqual(200);
    expect(resRequesting.headers["content-type"]).toMatch(/json/);
    expect(resRequesting.body).toEqual({ msg: "Friend request already sent." });
  });

  test("2 users who are already friends (no action)", async () => {
    const resFriends = await request(app)
      .post(`/api/users/${users[4]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resFriends.status).toEqual(200);
    expect(resFriends.headers["content-type"]).toMatch(/json/);
    expect(resFriends.body).toEqual({
      msg: "You are already friends with this user.",
    });
  });
});

describe("POST disallow friendship works", () => {
  test("2 users who are friends (unfriend)", async () => {});

  test("user who has been sent a friend request by the other (deny friend request)", async () => {});

  test("user who has sent a friend request to the other (revoke friend request)", async () => {});

  test("2 users who are already not friends (no action)", async () => {});
});
