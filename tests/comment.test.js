const Comment = require("../models/comment");
require("../passport");
const {
  users,
  posts,
  comments,
  populateDb,
  setTokens,
} = require("./sampleData");

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

describe("GET post's comments works", () => {
  test("post with 1 comment", async () => {
    // send GET request with postId parameter
    const response = await request(app).get(
      `/api/posts/${posts[1]._id}/comments`
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check comments are retrieved
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(comments[2]._id.toString());
  });

  test("post with multiple comments", async () => {
    // send GET request with postId parameter
    const response = await request(app).get(
      `/api/posts/${posts[0]._id}/comments`
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check comments are retrieved
    expect(response.body.length).toEqual(2);
    expect(response.body[0]._id).toEqual(comments[1]._id.toString());
    expect(response.body[1]._id).toEqual(comments[0]._id.toString());
  });

  test("post with no comments", async () => {
    // send GET request with postId parameter
    const response = await request(app).get(
      `/api/posts/${posts[2]._id}/comments`
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check empty array is received
    expect(response.body).toEqual([]);
  });
});
