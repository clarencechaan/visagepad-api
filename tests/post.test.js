const index = require("../routes/index");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", index);

test("GET user's posts works", (done) => {
  request(app)
    .get("/api/users/:userId/posts")
    .expect("Content-Type", /json/)
    // TODO
    // .expect([{}])
    .expect(200, done);
});

test("POST create post works", (done) => {
  request(app)
    .post("/api/users/:userId/posts")
    .type("form")
    // TODO
    // .send({ author, content, img_url })
    .then(() => {
      request(app)
        .get("/api/users/:userId/posts")
        // TODO
        // .expect({ author, content, img_url });
        .expect(200, done);
    });
});
