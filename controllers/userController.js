const User = require("../models/user");
const UserRelationship = require("../models/userRelationship");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { ObjectId } = require("mongodb");

/* GET specific user */
// input: params.userId
// output: { first_name, last_name, username, pfp }
exports.user_get = async function (req, res, next) {
  try {
    const user = await User.findById(req.params.userId).populate(
      "first_name last_name username pfp"
    );
    res.json(user);
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};

/* POST create user */
// input: { first_name, last_name, username, password, pfp }
// output: { userId }
exports.user_post = [
  body("first_name", "First name must be between 1 and 72 characters.")
    .trim()
    .isLength({ min: 1, max: 72 })
    .escape(),
  body("last_name", "Last name must be between 1 and 72 characters.")
    .trim()
    .isLength({ min: 1, max: 72 })
    .escape(),
  body("username", "Username must be between 1 and 24 characters.")
    .trim()
    .isLength({ min: 1, max: 24 })
    .escape(),
  body("password", "Password must be between 1 and 24 characters.")
    .trim()
    .isLength({ min: 1, max: 24 })
    .escape(),
  body("pfp", "PFP must be a URL.").isURL(),
  async function (req, res, next) {
    const errors = validationResult(req);
    const { first_name, last_name, username, password, pfp } = req.body;

    try {
      // throw error if errors exist
      if (!errors.isEmpty()) {
        throw errors.array();
      }

      // check if username exists
      const found = await User.findOne({ username: username });
      if (found) {
        res.json({
          msg: "User with username `" + username + "` already exists",
        });
        return;
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        first_name,
        last_name,
        username,
        password: hashedPassword,
        pfp,
      });

      // Save user
      const userId = (await user.save())._id;

      res.json({ userId });
    } catch (err) {
      res.json(err);
    }
  },
];

// get relationships between user A and user B
// creates UserRelationship in database if it doesn't exist
// input: userIdA, userIdB
// output: { userRelationshipA, userRelationshipB }
async function getUserRelationships(userIdA, userIdB) {
  let userRelationshipA = { relating_user: userIdA, related_user: userIdB };
  let userRelationshipB = { relating_user: userIdB, related_user: userIdA };

  try {
    const dbRelationshipA = await UserRelationship.findOne(userRelationshipA);
    const dbRelationshipB = await UserRelationship.findOne(userRelationshipB);

    // get user relationships if they exist
    userRelationshipA =
      (await UserRelationship.findOne(userRelationshipA)) || userRelationshipA;
    userRelationshipB =
      (await UserRelationship.findOne(userRelationshipB)) || userRelationshipB;

    console.log(userRelationshipA);

    // save user relationships to database if they don't exist
    if (!userRelationshipA.status) {
      userRelationshipA.status = "None";
      userRelationshipA._id = await new UserRelationship(
        userRelationshipA
      ).save()._id;
    }
    if (!userRelationshipB.status) {
      userRelationshipB.status = "None";
      userRelationshipB._id = await new UserRelationship(
        userRelationshipB
      ).save()._id;
    }

    return { userRelationshipA, userRelationshipB };
  } catch (err) {
    return null;
  }
}

/* POST allow friendship (send or accept friend request) */
// input: req.user, params.userId
// output: { msg }
exports.allow_user_friendship_post = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const requestingUserId = req.user._id;
      const requesteeUserId = ObjectId(req.params.userId);
      let { userRelationshipA, userRelationshipB } = getUserRelationships(
        requestingUserId,
        requesteeUserId
      );

      let msg = "";
      switch (
        { statusA: userRelationshipA.status, statusB: userRelationshipB.status }
      ) {
        case { statusA: "None", statusB: "None" }:
          userRelationshipA.status = "Requesting";
          userRelationshipB.status = "Requestee";
          msg = "Friend request sent.";
          break;
        case { statusA: "Requestee", statusB: "Requesting" }:
          userRelationshipA.status = "Friends";
          userRelationshipA.status = "Friends";
          msg = "Friend request accepted.";
      }

      res.json({ msg: msg || "No action taken." });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* POST disallow friendship (unfriend, deny friend request or revoke friend request) */
// input: req.user, params.userId
// output: { msg }
exports.disallow_user_friendship_post = async function (req, res, next) {
  try {
    const requestingUserId = req.user._id;
    const requesteeUserId = req.params.userId;
    let { userRelationshipA, userRelationshipB } = getUserRelationships(
      requestingUserId,
      requesteeUserId
    );

    let msg = "";
    switch (
      { statusA: userRelationshipA.status, statusB: userRelationshipB.status }
    ) {
      case { statusA: "Friends", statusB: "Friends" }:
        userRelationshipA.status = "None";
        userRelationshipA.status = "None";
        msg = "Unfriended.";
        break;
      case { statusA: "Requestee", statusB: "Requesting" }:
        userRelationshipA.status = "None";
        userRelationshipB.status = "None";
        msg = "Friend request denied.";
        break;
      case { statusA: "Requesting", statusB: "Requested" }:
        userRelationshipA.status = "None";
        userRelationshipB.status = "None";
    }

    res.json({ msg: msg || "No action taken." });
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};
