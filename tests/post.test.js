const User = require("../models/user");
const bcrypt = require("bcryptjs");

const index = require("../routes/index");
const mongoTesting = require("../mongoConfigTesting");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", index);

let users = [
  {
    first_name: "Leonard",
    last_name: "Day",
    username: "theapartment",
    password: "pass",
    pfp: "https://i.imgur.com/XUlRwHK.png",
  },
  {
    first_name: "Alex",
    last_name: "Morris",
    username: "chocolatebar",
    password: "s3cur3p4$$",
  },
];

beforeAll(async () => {
  await mongoTesting.initializeMongoServer();

  // save users to database, then get and set _id
  users[0]._id = (await new User(users[0]).save())._id.toString();
  users[1]._id = (await new User(users[1]).save())._id.toString();
});

afterAll(async () => {
  await mongoTesting.closeMongoServer();
});

test("GET user's posts works", async () => {});

test("POST create post works", async () => {});

test("GET user's feed works", async () => {});

test("GET specific post works", async () => {});

test("DELETE specific post works", async () => {});
