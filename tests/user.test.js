const User = require("../models/user");
const UserRelationship = require("../models/userRelationship");
const bcrypt = require("bcryptjs");
require("../passport");
const { users, populateDb, setTokens } = require("./sampleData");

const index = require("../routes/index");
const auth = require("../routes/auth");
const mongoTesting = require("../mongoConfigTesting");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", index);
app.use("/auth", auth);

beforeAll(async () => {
  await mongoTesting.initializeMongoServer();
  await populateDb();
  await setTokens(app);
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
    first_name: "homer",
    last_name: "simpsoN",
    username: "hojo742",
    password: "donuts",
    pfp: "https://i.imgur.com/ZaXjTYr.jpeg",
    cover: "https://i.imgur.com/lpz9lAS.jpeg",
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
  expect(dbUser.first_name).toEqual("Homer");
  expect(dbUser.last_name).toEqual("Simpson");
  expect(dbUser.username).toEqual(user.username);
  expect(dbUser.pfp).toEqual(user.pfp);
  expect(dbUser.cover).toEqual(user.cover);

  // check password is hashed and matches
  expect(await bcrypt.compare(user.password, dbUser.password)).toBeTruthy();

  // revert changes in database
  await User.findByIdAndDelete(userId);
});

describe("PUT allow friendship works", () => {
  test("2 users who are not friends (send friend request)", async () => {
    // send PUT request with userId parameter and token
    const resNotFriends = await request(app)
      .put(`/api/users/${users[1]._id}/allow-friendship`)
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

    // revert changes in database
    await UserRelationship.findByIdAndUpdate(relationshipA._id, {
      status: "None",
    });
    await UserRelationship.findByIdAndUpdate(relationshipB._id, {
      status: "None",
    });
  });

  test("2 users who are already not friends, without a user relationship in db (send friend request)", async () => {
    const resNotFriends = await request(app)
      .put(`/api/users/${users[2]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[1].token);
    expect(resNotFriends.status).toEqual(200);
    expect(resNotFriends.headers["content-type"]).toMatch(/json/);
    expect(resNotFriends.body).toEqual({ msg: "Friend request sent." });

    // check user relationship is saved to database
    const relationshipA = await UserRelationship.findOne({
      relating_user: users[1]._id,
      related_user: users[2]._id,
    });
    const relationshipB = await UserRelationship.findOne({
      relating_user: users[2]._id,
      related_user: users[1]._id,
    });
    expect(relationshipA.status).toEqual("Requesting");
    expect(relationshipB.status).toEqual("Requestee");

    // revert changes in database
    await UserRelationship.findByIdAndDelete(relationshipA._id);
    await UserRelationship.findByIdAndDelete(relationshipB._id);
  });

  test("user who has been sent a friend request by the other (accept friend request)", async () => {
    const resRequestee = await request(app)
      .put(`/api/users/${users[3]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resRequestee.status).toEqual(200);
    expect(resRequestee.headers["content-type"]).toMatch(/json/);
    expect(resRequestee.body).toEqual({ msg: "Accepted friend request." });

    // check user relationship is saved to database
    const relationshipA = await UserRelationship.findOne({
      relating_user: users[0]._id,
      related_user: users[3]._id,
    });
    const relationshipB = await UserRelationship.findOne({
      relating_user: users[3]._id,
      related_user: users[0]._id,
    });
    expect(relationshipA.status).toEqual("Friends");
    expect(relationshipB.status).toEqual("Friends");

    // revert changes in database
    await UserRelationship.findByIdAndUpdate(relationshipA._id, {
      status: "Requestee",
    });
    await UserRelationship.findByIdAndUpdate(relationshipB._id, {
      status: "Requesting",
    });
  });

  test("user who has already sent a friend request to the other (no action)", async () => {
    const resRequesting = await request(app)
      .put(`/api/users/${users[2]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resRequesting.status).toEqual(200);
    expect(resRequesting.headers["content-type"]).toMatch(/json/);
    expect(resRequesting.body).toEqual({ msg: "Friend request already sent." });
  });

  test("2 users who are already friends (no action)", async () => {
    const resFriends = await request(app)
      .put(`/api/users/${users[4]._id}/allow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resFriends.status).toEqual(200);
    expect(resFriends.headers["content-type"]).toMatch(/json/);
    expect(resFriends.body).toEqual({
      msg: "You are already friends with this user.",
    });
  });
});

describe("PUT disallow friendship works", () => {
  test("2 users who are friends (unfriend)", async () => {
    const resFriends = await request(app)
      .put(`/api/users/${users[4]._id}/disallow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resFriends.status).toEqual(200);
    expect(resFriends.headers["content-type"]).toMatch(/json/);
    expect(resFriends.body).toEqual({ msg: "Unfriended user." });

    // check user relationship is saved to database
    const relationshipA = await UserRelationship.findOne({
      relating_user: users[0]._id,
      related_user: users[4]._id,
    });
    const relationshipB = await UserRelationship.findOne({
      relating_user: users[4]._id,
      related_user: users[0]._id,
    });
    expect(relationshipA.status).toEqual("None");
    expect(relationshipB.status).toEqual("None");

    // revert changes in database
    await UserRelationship.findByIdAndUpdate(relationshipA._id, {
      status: "Friends",
    });
    await UserRelationship.findByIdAndUpdate(relationshipB._id, {
      status: "Friends",
    });
  });

  test("user who has been sent a friend request by the other (deny friend request)", async () => {
    const resRequestee = await request(app)
      .put(`/api/users/${users[3]._id}/disallow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resRequestee.status).toEqual(200);
    expect(resRequestee.headers["content-type"]).toMatch(/json/);
    expect(resRequestee.body).toEqual({ msg: "Denied friend request." });

    // check user relationship is saved to database
    const relationshipA = await UserRelationship.findOne({
      relating_user: users[0]._id,
      related_user: users[3]._id,
    });
    const relationshipB = await UserRelationship.findOne({
      relating_user: users[3]._id,
      related_user: users[0]._id,
    });
    expect(relationshipA.status).toEqual("None");
    expect(relationshipB.status).toEqual("None");

    // revert changes in database
    await UserRelationship.findByIdAndUpdate(relationshipA._id, {
      status: "Requestee",
    });
    await UserRelationship.findByIdAndUpdate(relationshipB._id, {
      status: "Requesting",
    });
  });

  test("user who has sent a friend request to the other (revoke friend request)", async () => {
    const resRequesting = await request(app)
      .put(`/api/users/${users[2]._id}/disallow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resRequesting.status).toEqual(200);
    expect(resRequesting.headers["content-type"]).toMatch(/json/);
    expect(resRequesting.body).toEqual({ msg: "Revoked friend request." });

    // check user relationship is saved to database
    const relationshipA = await UserRelationship.findOne({
      relating_user: users[0]._id,
      related_user: users[2]._id,
    });
    const relationshipB = await UserRelationship.findOne({
      relating_user: users[2]._id,
      related_user: users[0]._id,
    });
    expect(relationshipA.status).toEqual("None");
    expect(relationshipB.status).toEqual("None");

    // revert changes in database
    await UserRelationship.findByIdAndUpdate(relationshipA._id, {
      status: "Requesting",
    });
    await UserRelationship.findByIdAndUpdate(relationshipB._id, {
      status: "Requestee",
    });
  });

  test("2 users who are already not friends (no action)", async () => {
    const resNotFriends = await request(app)
      .put(`/api/users/${users[1]._id}/disallow-friendship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(resNotFriends.status).toEqual(200);
    expect(resNotFriends.headers["content-type"]).toMatch(/json/);
    expect(resNotFriends.body).toEqual({
      msg: "You are already not friends with this user.",
    });
  });

  test("2 users who are already not friends, without a user relationship in db (no action)", async () => {
    const resNotFriends = await request(app)
      .put(`/api/users/${users[2]._id}/disallow-friendship`)
      .set("Authorization", "Bearer " + users[1].token);
    expect(resNotFriends.status).toEqual(200);
    expect(resNotFriends.headers["content-type"]).toMatch(/json/);
    expect(resNotFriends.body).toEqual({
      msg: "You are already not friends with this user.",
    });
  });
});

describe("GET friends list works", () => {
  test("user with multiple friends", async () => {
    // send GET request with userId parameter
    const response = await request(app)
      .get(`/api/users/${users[4]._id}/friends`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives friends
    expect(response.body.length).toEqual(3);
    expect(
      response.body.some((friend) => friend._id === users[0]._id.toString())
    ).toBeTruthy();
    expect(
      response.body.some((friend) => friend._id === users[2]._id.toString())
    ).toBeTruthy();
    expect(
      response.body.some((friend) => friend._id === users[3]._id.toString())
    ).toBeTruthy();
  });

  test("user with 1 friend", async () => {
    // send GET request with userId parameter
    const response = await request(app)
      .get(`/api/users/${users[0]._id}/friends`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives friend
    expect(
      response.body.some((friend) => friend._id === users[4]._id.toString())
    ).toBeTruthy();
    expect(response.body.length).toEqual(1);
  });

  test("user with no friends", async () => {
    // send GET request with userId parameter
    const response = await request(app)
      .get(`/api/users/${users[1]._id}/friends`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives empty array
    expect(response.body.length).toEqual(0);
  });
});

describe("GET mutual friends list works", () => {
  test("users with multiple mutuals", async () => {
    // send GET request with userId parameter and token
    const response = await request(app)
      .get(`/api/users/${users[4]._id}/mutuals`)
      .set("Authorization", "Bearer " + users[5].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives mutual friends
    expect(response.body.length).toEqual(2);
    expect(response.body[0]._id).toEqual(users[2]._id.toString());
    expect(response.body[1]._id).toEqual(users[3]._id.toString());
  });

  test("users with 1 mutual", async () => {
    // send GET request with userId parameter and token
    const response = await request(app)
      .get(`/api/users/${users[2]._id}/mutuals`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives mutual friends
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(users[4]._id.toString());
  });

  test("users with no mutual", async () => {
    // send GET request with userId parameter and token
    const response = await request(app)
      .get(`/api/users/${users[4]._id}/mutuals`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives empty array
    expect(response.body).toEqual([]);
  });
});

describe("GET friend requests works", () => {
  test("user with multiple friend request", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/friend-requests`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives friend requests
    expect(response.body.length).toEqual(2);
    expect(response.body[0]._id).toEqual(users[3]._id.toString());
    expect(response.body[1]._id).toEqual(users[5]._id.toString());
  });

  test("user with 1 friend request", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/friend-requests`)
      .set("Authorization", "Bearer " + users[2].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives friend requests
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(users[0]._id.toString());
  });

  test("user with no friend requests", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/friend-requests`)
      .set("Authorization", "Bearer " + users[1].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives empty array
    expect(response.body).toEqual([]);
  });
});

describe("GET relationship status of user works", () => {
  test("user who is not a friend", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/users/${users[1]._id}/relationship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check status given is correct
    expect(response.body.status).toEqual("None");
  });

  test("user who is not a friend, without a user relationship in db", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/users/${users[2]._id}/relationship`)
      .set("Authorization", "Bearer " + users[1].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check status given is correct
    expect(response.body.status).toEqual("None");
  });

  test("user who has sent a friend request", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/users/${users[3]._id}/relationship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check status given is correct
    expect(response.body.status).toEqual("Requesting");
  });

  test("user who has been sent a friend request", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/users/${users[2]._id}/relationship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check status given is correct
    expect(response.body.status).toEqual("Requestee");
  });

  test("user who is a friend", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/users/${users[4]._id}/relationship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check status given is correct
    expect(response.body.status).toEqual("Friends");
  });

  test("user is self", async () => {
    // send GET request with token
    const response = await request(app)
      .get(`/api/users/${users[0]._id}/relationship`)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check status given is correct
    expect(response.body.status).toEqual("Self");
  });
});

describe("PUT update profile picture or cover photo works", () => {
  test("update profile picture works", async () => {
    // send PUT request with token and pfp
    const response = await request(app)
      .put(`/api/update-photo`)
      .set("Authorization", "Bearer " + users[1].token)
      .type("form")
      .send({ pfp: "https://i.imgur.com/ZaXjTYr.jpeg" });
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({ msg: "Photo successfully updated." });

    // check user with updated pfp is saved to database
    const user = await User.findById(users[1]._id);
    expect(user.pfp).toEqual("https://i.imgur.com/ZaXjTYr.jpeg");

    // revert changes in database
    await User.findByIdAndUpdate(users[1]._id, users[1]);
  });

  test("update cover photo works", async () => {
    // send PUT request with token and cover
    const response = await request(app)
      .put(`/api/update-photo`)
      .set("Authorization", "Bearer " + users[1].token)
      .type("form")
      .send({ cover: "https://i.imgur.com/lpz9lAS.jpeg" });
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({ msg: "Photo successfully updated." });

    // check user with updated pfp is saved to
    const user = await User.findById(users[1]._id);
    expect(user.cover).toEqual("https://i.imgur.com/lpz9lAS.jpeg");

    // revert changes in database
    await User.findByIdAndUpdate(users[1]._id, users[1]);
  });
});

describe("GET search users works", () => {
  test("first name match", async () => {
    // send GET request
    const response = await request(app).get(`/api/search-users/leonard`);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check correct user(s) given
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(users[0]._id.toString());
  });

  test("full name match", async () => {
    // send GET request
    const response = await request(app).get(`/api/search-users/tom hanks`);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check correct user(s) given
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(users[2]._id.toString());
  });

  test("no match", async () => {
    // send GET request
    const response = await request(app).get(`/api/search-users/joseph badmon`);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check correct user(s) given
    expect(response.body).toEqual([]);
  });
});

test("GET people you may know works", async () => {
  // send GET request with token
  const response = await request(app)
    .get(`/api/people-may-know`)
    .set("Authorization", "Bearer " + users[0].token);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);

  // check correct user(s) given
  // user 1, 2, 3, 5
  expect(response.body.length).toEqual(4);
  expect(
    response.body.some((user) => user._id === users[1]._id.toString())
  ).toBeTruthy();
  expect(
    response.body.some((user) => user._id === users[2]._id.toString())
  ).toBeTruthy();
  expect(
    response.body.some((user) => user._id === users[3]._id.toString())
  ).toBeTruthy();
  expect(
    response.body.some((user) => user._id === users[5]._id.toString())
  ).toBeTruthy();
});
