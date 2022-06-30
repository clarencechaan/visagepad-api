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

test("POST create comment on post works", async () => {
  const comment = {
    message:
      "Walk convinced pain horses breeding turned seen admire raising say year shew nor.",
  };

  // send POST request with postId parameter and comment
  const response = await request(app)
    .post(`/api/posts/${posts[0]._id}/comments`)
    .set("Authorization", "Bearer " + users[0].token)
    .type("form")
    .send(comment);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);

  // check returned commentId is a MongoDB ObjectID
  const commentId = response.body.commentId;
  expect(commentId.match(/^[0-9a-fA-F]{24}$/)).toBeTruthy();

  // check comment is in database
  const dbComment = await Comment.findById(commentId);
  expect(dbComment.message).toEqual(comment.message);
  expect(dbComment.author).toEqual(users[0]._id);
  expect(dbComment.post).toEqual(posts[0]._id);

  // revert changes in database
  await Comment.findByIdAndDelete(commentId);
});

describe("DELETE specific comment works", () => {
  test("request is from author", async () => {
    // send DELETE request with postId parameter and token
    const response = await request(app)
      .delete("/api/comments/" + comments[0]._id)
      .set("Authorization", "Bearer " + users[1].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check comment no longer exists
    expect(await Comment.findById(comments[0]._id)).toBeFalsy();

    // check msg
    expect(response.body.msg).toEqual("Comment successfully deleted.");

    // revert changes in database
    await new Comment(comments[0]).save();
  });

  test("request is not from author", async () => {
    // send DELETE request with postId parameter and token
    const response = await request(app)
      .delete("/api/comments/" + comments[0]._id)
      .set("Authorization", "Bearer " + users[2].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check comment still exists
    expect(await Comment.findById(comments[0]._id)).toBeTruthy();

    // check msg
    expect(response.body.msg).toEqual(
      "You are not authorized to delete this comment."
    );
  });
});
