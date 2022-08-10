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
      .set("Authorization", "Bearer " + users[6].token);
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

  test("specific page number: 1", async () => {
    // send GET request with token
    const response = await request(app)
      .get("/api/my-feed/1")
      .set("Authorization", "Bearer " + users[4].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(3);

    // check posts are correct and are given in date desc order
    expect(response.body[0]._id).toEqual(posts[2]._id.toString());
    expect(response.body[1]._id).toEqual(posts[1]._id.toString());
    expect(response.body[2]._id).toEqual(posts[4]._id.toString());
  });

  test("specific page number: 2", async () => {
    // send GET request with token
    const response = await request(app)
      .get("/api/my-feed/2")
      .set("Authorization", "Bearer " + users[4].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body.length).toEqual(1);

    // check posts are correct and are given in date desc order
    expect(response.body[0]._id).toEqual(posts[0]._id.toString());
  });
});

test("GET specific post works", async () => {
  // send GET request with postId parameter
  const response = await request(app).get("/api/posts/" + posts[0]._id);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);
  expect(response.body._id).toEqual(posts[0]._id.toString());

  // author, content, date, img_url, likes
  expect(response.body.author._id).toEqual(posts[0].author._id.toString());
  expect(response.body.content).toEqual(posts[0].content);
  expect(new Date(response.body.date).getTime()).toEqual(posts[0].date);
  expect(response.body.likes).toEqual(posts[0].likes);
});

describe("`DELETE` specific post works", () => {
  test("request is from author", async () => {
    // send DELETE request with postId parameter and token
    const response = await request(app)
      .delete("/api/posts/" + posts[0]._id)
      .set("Authorization", "Bearer " + users[0].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check post no longer exists
    expect(await Post.findById(posts[0]._id)).toBeFalsy();

    // check msg
    expect(response.body.msg).toEqual("Post successfully deleted.");

    // revert changes in database
    await new Post(posts[0]).save();
  });

  test("request is not from author", async () => {
    // send DELETE request with postId parameter and token
    const response = await request(app)
      .delete("/api/posts/" + posts[0]._id)
      .set("Authorization", "Bearer " + users[1].token);
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check post still exists
    expect(await Post.findById(posts[0]._id)).toBeTruthy();

    // check msg
    expect(response.body.msg).toEqual(
      "You are not authorized to delete this post."
    );
  });
});

test("PUT like specific post works", async () => {
  // send PUT request with postId parameter and token
  const response = await request(app)
    .put(`/api/posts/${posts[0]._id}/like`)
    .set("Authorization", "Bearer " + users[1].token);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);

  // check msg
  expect(response.body.msg).toEqual("Post successfully liked.");

  // check post has been liked
  expect((await Post.findById(posts[0]._id)).likes).toEqual([users[1]._id]);

  // revert changes in database
  await Post.findByIdAndUpdate(posts[0]._id, {
    $pull: { likes: users[1]._id },
  });
});

test("PUT unlike specific post works", async () => {
  // send PUT request with postId parameter and token
  const response = await request(app)
    .put(`/api/posts/${posts[4]._id}/unlike`)
    .set("Authorization", "Bearer " + users[2].token);
  expect(response.status).toEqual(200);
  expect(response.headers["content-type"]).toMatch(/json/);

  // check msg
  expect(response.body.msg).toEqual("Post successfully unliked.");

  // check post has been unliked
  expect((await Post.findById(posts[4]._id)).likes).toEqual([]);

  // revert changes in database
  await Post.findByIdAndUpdate(posts[4]._id, {
    $push: { likes: users[2]._id },
  });
});

describe("PUT edit post works", () => {
  test("user is authorized", async () => {
    // send PUT request with postId parameter and token
    const response = await request(app)
      .put(`/api/posts/${posts[0]._id}`)
      .set("Authorization", "Bearer " + users[0].token)
      .type("form")
      .send({
        content: "My updated content",
        img_url: "https://i.imgur.com/v2bypHW.jpeg",
      });
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check msg
    expect(response.body.msg).toEqual("Post successfully edited.");

    // check post has been updated
    expect((await Post.findById(posts[0]._id)).content).toEqual(
      "My updated content"
    );
    expect((await Post.findById(posts[0]._id)).img_url).toEqual(
      "https://i.imgur.com/v2bypHW.jpeg"
    );

    // revert changes in database
    await Post.findByIdAndUpdate(posts[0]._id, posts[0]);
  });

  test("user is unauthorized", async () => {
    // send PUT request with postId parameter and token
    const response = await request(app)
      .put(`/api/posts/${posts[0]._id}`)
      .set("Authorization", "Bearer " + users[1].token)
      .type("form")
      .send({ content: "My updated content" });
    expect(response.status).toEqual(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check msg
    expect(response.body.msg).toEqual(
      "You are unauthorized to edit this post."
    );

    // check post has not been updated
    expect((await Post.findById(posts[0]._id)).content).toEqual(
      posts[0].content
    );
  });
});
