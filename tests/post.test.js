const Post = require("../models/post");
require("../passport");
const { users, posts, populateDb, setTokens } = require("./sampleData");

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

describe("GET user's posts works", () => {
  test("user with 1 post", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(`/api/users/${users[2]._id}/posts`);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(posts[2]._id.toString());
  });

  test("user with no posts", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(`/api/users/${users[3]._id}/posts`);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(0);
  });

  test("user with multiple posts", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(`/api/users/${users[0]._id}/posts`);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(2);

    // check posts are correct and are given in date desc order
    expect(response.body[0]._id).toEqual(posts[1]._id.toString());
    expect(response.body[1]._id).toEqual(posts[0]._id.toString());
  });
});

test("POST create post works", async () => {
  const post = {
    content:
      "Bed read whom satisfied early disposal. Formerly others furnished dear unaffected between enjoyed. Raillery quitting purse remaining men show happiness must seems game sex conduct. Hastened busy end formal sold basket wholly sentiments began. Determine friendship anxious ignorant thought insipidity finished brought before offered civil prevailed bachelor avoid visit.",
    img_url: "https://i.imgur.com/1Dn4AvO.jpg",
  };

  // send POST request with token
  const response = await request(app)
    .post(`/api/users/${users[0]._id}/posts`)
    .set("Authorization", "Bearer " + users[0].token)
    .type("form")
    .send(post);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);

  // check returned postId is a MongoDB ObjectID
  expect(response.body.postId.match(/^[0-9a-fA-F]{24}$/)).toBeTruthy();

  // check post is in database
  const postId = response.body.postId;
  const dbPost = await Post.findById(postId);
  expect(dbPost.author).toEqual(users[0]._id);
  expect(dbPost.content).toEqual(post.content);
  expect(dbPost.img_url).toEqual(post.img_url);
  expect(dbPost.likes).toEqual([]);

  // revert changes in database
  await Post.findByIdAndDelete(postId);
});

describe("GET user's feed works", () => {
  test("feed with 1 post", async () => {
    // send GET request with token
    const response = await request(app)
      .get("/api/my-feed")
      .set("Authorization", "Bearer " + users[3].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(posts[4]._id.toString());
  });

  test("feed with no posts", async () => {
    // send GET request with token
    const response = await request(app)
      .get("/api/my-feed")
      .set("Authorization", "Bearer " + users[1].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(0);
  });

  test("feed with multiple posts", async () => {
    // send GET request with token
    const response = await request(app)
      .get("/api/my-feed")
      .set("Authorization", "Bearer " + users[4].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(4);

    // check posts are correct and are given in date desc order
    expect(response.body[0]._id).toEqual(posts[2]._id.toString());
    expect(response.body[1]._id).toEqual(posts[1]._id.toString());
    expect(response.body[2]._id).toEqual(posts[4]._id.toString());
    expect(response.body[3]._id).toEqual(posts[0]._id.toString());
  });
});

test("GET specific post works", async () => {});

test("DELETE specific post works", async () => {});

describe("PUT toggle like specific post", () => {
  test("like post", async () => {});

  test("unlike post", async () => {});
});
