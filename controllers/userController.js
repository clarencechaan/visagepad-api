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
    // get user relationships from database if they exist
    const dbRelationshipA = await UserRelationship.findOne(userRelationshipA);
    const dbRelationshipB = await UserRelationship.findOne(userRelationshipB);
    userRelationshipA = dbRelationshipA || userRelationshipA;
    userRelationshipB = dbRelationshipB || userRelationshipB;

    // save user relationships to database if they don't exist
    if (!userRelationshipA.status) {
      userRelationshipA.status = "None";
      userRelationshipA._id = (
        await new UserRelationship(userRelationshipA).save()
      )._id;
    }
    if (!userRelationshipB.status) {
      userRelationshipB.status = "None";
      userRelationshipB._id = (
        await new UserRelationship(userRelationshipB).save()
      )._id;
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
      const requesteeUserId = req.params.userId;
      let { userRelationshipA, userRelationshipB } = await getUserRelationships(
        requestingUserId,
        requesteeUserId
      );

      let msg = "";
      if (
        userRelationshipA.status === "None" &&
        userRelationshipA.status === "None"
      ) {
        // users are not friends
        userRelationshipA.status = "Requesting";
        userRelationshipB.status = "Requestee";
        // save changes to database
        await UserRelationship.findByIdAndUpdate(
          userRelationshipA._id,
          userRelationshipA
        );
        await UserRelationship.findByIdAndUpdate(
          userRelationshipB._id,
          userRelationshipB
        );
        msg = "Friend request sent.";
      } else if (
        userRelationshipA.status === "Requestee" &&
        userRelationshipB.status === "Requesting"
      ) {
        // user is the recipient of a friend request
        userRelationshipA.status = "Friends";
        userRelationshipB.status = "Friends";
        // save changes to database
        await UserRelationship.findByIdAndUpdate(
          userRelationshipA._id,
          userRelationshipA
        );
        await UserRelationship.findByIdAndUpdate(
          userRelationshipB._id,
          userRelationshipB
        );
        msg = "Accepted friend request.";
      } else if (
        userRelationshipA.status === "Requesting" &&
        userRelationshipB.status === "Requestee"
      ) {
        // user is already requesting friend
        msg = "Friend request already sent.";
      } else if (
        userRelationshipA.status === "Friends" &&
        userRelationshipB.status === "Friends"
      ) {
        // users are already friends
        msg = "You are already friends with this user.";
      }

      res.json({ msg });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* POST disallow friendship (unfriend, deny friend request or revoke friend request) */
// input: req.user, params.userId
// output: { msg }
exports.disallow_user_friendship_post = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const requestingUserId = req.user._id;
      const requesteeUserId = req.params.userId;
      let { userRelationshipA, userRelationshipB } = await getUserRelationships(
        requestingUserId,
        requesteeUserId
      );

      let msg = "";
      if (
        userRelationshipA.status === "Friends" &&
        userRelationshipA.status === "Friends"
      ) {
        // users are friends
        userRelationshipA.status = "None";
        userRelationshipB.status = "None";
        // save changes to database
        await UserRelationship.findByIdAndUpdate(
          userRelationshipA._id,
          userRelationshipA
        );
        await UserRelationship.findByIdAndUpdate(
          userRelationshipB._id,
          userRelationshipB
        );
        msg = "Unfriended user.";
      } else if (
        userRelationshipA.status === "Requestee" &&
        userRelationshipB.status === "Requesting"
      ) {
        // user is the recipient of a friend request
        userRelationshipA.status = "None";
        userRelationshipB.status = "None";
        // save changes to database
        await UserRelationship.findByIdAndUpdate(
          userRelationshipA._id,
          userRelationshipA
        );
        await UserRelationship.findByIdAndUpdate(
          userRelationshipB._id,
          userRelationshipB
        );
        msg = "Denied friend request.";
      } else if (
        userRelationshipA.status === "Requesting" &&
        userRelationshipB.status === "Requestee"
      ) {
        // user is requesting friend
        userRelationshipA.status = "None";
        userRelationshipB.status = "None";
        // save changes to database
        await UserRelationship.findByIdAndUpdate(
          userRelationshipA._id,
          userRelationshipA
        );
        await UserRelationship.findByIdAndUpdate(
          userRelationshipB._id,
          userRelationshipB
        );
        msg = "Revoked friend request.";
      } else if (
        userRelationshipA.status === "None" &&
        userRelationshipB.status === "None"
      ) {
        // users are not friends
        msg = "You are already not friends with this user.";
      }

      res.json({ msg });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET friends list */
// input: params.userId
// output: [{ username, first_name, last_name, pfp }, ...]
exports.friends_get = async function (req, res, next) {
  try {
    const relationships = await UserRelationship.find({
      relating_user: req.params.userId,
      status: "Friends",
    })
      .select("related_user")
      .populate("related_user", "username first_name last_name pfp");
    const friends = relationships.map((relationship) => {
      return relationship.related_user;
    });
    res.json(friends);
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};
