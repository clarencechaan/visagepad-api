const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
require("../passport");

const auth = require("../routes/auth");
const mongoTesting = require("./mongoConfigTesting");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/auth", auth);
app.use("/auth/check-token", [
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    res.json({ msg: "Success" });
  },
]);

let user = {
  first_name: "Leonard",
  last_name: "Day",
  username: "theapartment",
  plaintext_password: "pass",
  pfp: "https://i.imgur.com/XUlRwHK.png",
};

beforeAll(async () => {
  await mongoTesting.initializeMongoServer();

  // hash password
  user.password = await bcrypt.hash(user.plaintext_password, 10);

  // save user to database, then get and set _id
  user._id = (await new User(user).save())._id.toString();
});

afterAll(async () => {
  await mongoTesting.closeMongoServer();
});

test("POST login works", async () => {
  // send POST request containing username and password
  const resLogin = await request(app)
    .post("/auth/login")
    .type("form")
    .send({ username: "theapartment", password: "pass" });
  expect(resLogin.status).toEqual(200);
  expect(resLogin.headers["content-type"]).toMatch(/json/);

  // check returned user info matches
  expect(resLogin.body.user.username).toEqual(user.username);
  expect(resLogin.body.user.first_name).toEqual(user.first_name);
  expect(resLogin.body.user.last_name).toEqual(user.last_name);
  expect(resLogin.body.user.pfp).toEqual(user.pfp);
  expect(resLogin.body.user._id).toEqual(user._id);

  // check token works
  const resCheckTokenSuccess = await request(app)
    .get("/auth/check-token")
    .set("Authorization", "Bearer " + resLogin.body.token);
  expect(resCheckTokenSuccess.body.msg).toEqual("Success");

  // check other tokens fail
  const BAD_TOKEN = "1337";
  const resCheckTokenUnauthorized = await request(app)
    .get("/auth/check-token")
    .set("Authorization", "Bearer " + BAD_TOKEN);
  expect(resCheckTokenUnauthorized.text).toEqual("Unauthorized");
});
