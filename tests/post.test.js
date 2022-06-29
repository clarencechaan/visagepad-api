require("../passport");
const {
  users,
  relationships,
  posts,
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

describe("GET user's posts works", () => {
  test("user with 1 post", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(
      "/api/users/" + users[2]._id + "/posts"
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(1);
    expect(response.body[0]._id).toEqual(posts[2]._id.toString());
    console.log(response.body);
  });

  test("user with no posts", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(
      "/api/users/" + users[3]._id + "/posts"
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(0);
  });

  test("user with multiple posts", async () => {
    // send GET request with userId parameter
    const response = await request(app).get(
      "/api/users/" + users[0]._id + "/posts"
    );
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(2);
    expect(response.body[0]._id).toEqual(posts[0]._id.toString());
    expect(response.body[1]._id).toEqual(posts[1]._id.toString());
  });
});

test("POST create post works", async () => {
  const response = await request(app)
    .post(`/api/users/${users[0]._id}/posts`)
    .set("Authorization", "Bearer " + users[0].token);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);
});

describe("GET user's feed works", () => {
  test("feed with 1 post", async () => {});

  test("feed with no posts", async () => {});

  test("feed with multiple posts", async () => {});
});

test("GET specific post works", async () => {});

test("DELETE specific post works", async () => {});

describe("PUT toggle like specific post", () => {
  test("like post", async () => {});

  test("unlike post", async () => {});
});
