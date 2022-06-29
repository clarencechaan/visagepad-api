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
    first_name: "Homer",
    last_name: "Simpson",
    username: "hojo742",
    password: "donuts",
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

  // check password is hashed and matches
  expect(await bcrypt.compare(user.password, dbUser.password)).toBeTruthy();

  // revert changes in database
  await User.findByIdAndDelete(userId);
});

describe("PUT allow friendship works", () => {
  test("2 users who are not friends (send friend request)", async () => {
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
});

describe("GET friends list works", () => {
  test("user with multiple friends", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(
      `/api/users/${users[4]._id}/friends`
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives friends
    expect(
      response.body.some((friend) => friend._id === users[0]._id.toString())
    ).toBeTruthy();
    expect(
      response.body.some((friend) => friend._id === users[2]._id.toString())
    ).toBeTruthy();
    expect(response.body.length).toEqual(2);
  });

  test("user with 1 friend", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(
      `/api/users/${users[0]._id}/friends`
    );
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
    const response = await request(app).get(
      `/api/users/${users[1]._id}/friends`
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check response gives empty array
    expect(response.body.length).toEqual(0);
  });
});
