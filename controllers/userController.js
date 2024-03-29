const User = require("../models/user");
const UserRelationship = require("../models/userRelationship");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

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
  body("first_name", "First name must be between 1 and 24 characters.")
    .trim()
    .isLength({ min: 1, max: 24 }),
  body("last_name", "Last name must be between 1 and 24 characters.")
    .trim()
    .isLength({ min: 1, max: 24 }),
  body("username", "Username must be between 1 and 24 characters.")
    .trim()
    .isLength({ min: 1, max: 24 }),
  body("password", "Password must be between 1 and 24 characters.")
    .trim()
    .isLength({ min: 1, max: 24 }),
  body("pfp", "PFP must be a URL.").optional({ checkFalsy: true }).isURL(),
  body("cover", "Cover photo must be a URL.")
    .optional({ checkFalsy: true })
    .isURL(),
  async function (req, res, next) {
    const errors = validationResult(req);
    const { password, pfp, cover } = req.body;
    // capitalize first and last name
    const first_name =
      req.body.first_name[0].toUpperCase() +
      req.body.first_name.substring(1).toLowerCase();
    const last_name =
      req.body.last_name[0].toUpperCase() +
      req.body.last_name.substring(1).toLowerCase();
    const username = req.body.username.toLowerCase();

    try {
      // throw error if validation errors exist
      if (!errors.isEmpty()) {
        throw errors.array();
      }

      // check if username exists
      const found = await User.findOne({ username: username });
      if (found) {
        res.json({
          msg: `User with username "${username}" already exists`,
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
        cover,
      });

      // Save user
      const userId = (await user.save())._id;

      res.json({ userId });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

// get relationships between user A and user B
// creates UserRelationship in database if it doesn't exist
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

/* PUT allow friendship (send or accept friend request) */
// input: req.user, params.userId
// output: { msg }
exports.allow_user_friendship_put = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const relatingUserId = req.user._id;
      const relatedUserId = req.params.userId;
      let { userRelationshipA, userRelationshipB } = await getUserRelationships(
        relatingUserId,
        relatedUserId
      );

      let msg = "";
      switch ((userRelationshipA.status, userRelationshipB.status)) {
        case ("None", "None"):
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
          break;
        case ("Requestee", "Requesting"):
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
          break;
        case ("Requesting", "Requestee"):
          // user is already requesting friend
          msg = "Friend request already sent.";
          break;
        case ("Friends", "Friends"):
          // users are already friends
          msg = "You are already friends with this user.";
      }

      res.json({ msg });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* PUT disallow friendship (unfriend, deny friend request or revoke friend request) */
// input: req.user, params.userId
// output: { msg }
exports.disallow_user_friendship_put = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const relatingUserId = req.user._id;
      const relatedUserId = req.params.userId;
      let { userRelationshipA, userRelationshipB } = await getUserRelationships(
        relatingUserId,
        relatedUserId
      );

      let msg = "";
      switch ((userRelationshipA.status, userRelationshipB.status)) {
        case ("None", "None"):
          // users are not friends
          msg = "You are already not friends with this user.";
          break;
        case ("Requestee", "Requesting"):
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
          break;
        case ("Requesting", "Requestee"):
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
          break;
        case ("Friends", "Friends"):
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
      }

      res.json({ msg });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET friends list */
// input: req.user, params.userId,
// output: [{ username, first_name, last_name, pfp }, ...]
exports.friends_get = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const relationships = await UserRelationship.find({
        relating_user: req.params.userId,
        status: "Friends",
      })
        .select("related_user")
        .populate("related_user", "username first_name last_name pfp");
      let friends = relationships.map((relationship) => {
        return relationship.related_user;
      });

      res.json(friends);
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET mutual friends list */
// input: req.user, params.userId
// output: [{ username, first_name, last_name, pfp }, ...]
exports.mutuals_get = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const relationshipsA = await UserRelationship.find({
        relating_user: req.user._id,
        status: "Friends",
      })
        .select("related_user")
        .populate("related_user", "username first_name last_name pfp");
      const relationshipsB = await UserRelationship.find({
        relating_user: req.params.userId,
        status: "Friends",
      })
        .select("related_user")
        .populate("related_user", "username first_name last_name pfp");

      const friendsA = relationshipsA.map((relationship) => {
        return relationship.related_user;
      });
      const friendsB = relationshipsB.map((relationship) => {
        return relationship.related_user;
      });

      let mutuals = [];
      for (const friendA of friendsA) {
        if (friendsB.some((b) => b._id.toString() === friendA._id.toString())) {
          mutuals.push(friendA);
        }
      }

      res.json(mutuals);
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET friend requests */
// input: req.user
// output: [{ username, first_name, last_name, pfp }, ...]
exports.friend_requests_get = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const relationships = await UserRelationship.find({
        relating_user: req.user._id,
        status: "Requestee",
      })
        .select("related_user")
        .populate("related_user", "username first_name last_name pfp");

      const friendRequests = relationships.map((relationship) => {
        return relationship.related_user;
      });

      res.json(friendRequests);
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET relationship status of user */
// input: req.user, params.userId
// output: { status }
exports.relationship_get = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    const relatingUserId = req.user._id;
    const relatedUserId = req.params.userId;
    if (relatingUserId.toString() === relatedUserId.toString()) {
      res.json({ status: "Self" });
      return;
    }

    try {
      const { userRelationshipA, userRelationshipB } =
        await getUserRelationships(relatingUserId, relatedUserId);

      res.json({ status: userRelationshipB.status });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* PUT update profile picture or cover photo */
// input: req.user, { pfp, cover }
// output: { msg }
exports.user_photo_put = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        pfp: req.body.pfp,
        cover: req.body.cover,
      });
      res.json({ msg: "Photo successfully updated." });
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];

/* GET search users */
// input: params.query
// output: [{ first_name, last_name, pfp }, ...]
exports.search_users_get = async function (req, res, next) {
  let terms = req.params.query.trim().replace(/  +/g, " ").split(" ");
  let expressions = [
    { first_name: { $regex: terms[0], $options: "i" } },
    { last_name: { $regex: terms[0], $options: "i" } },
  ];
  if (terms[1]) {
    expressions.push({ first_name: { $regex: terms[1], $options: "i" } });
    expressions.push({ last_name: { $regex: terms[1], $options: "i" } });
  }

  let expression = {};
  if (!terms[1]) {
    expression = {
      $or: [
        { first_name: { $regex: `^${terms[0]}`, $options: "i" } },
        { last_name: { $regex: `^${terms[0]}`, $options: "i" } },
      ],
    };
  } else {
    expression = {
      $or: [
        {
          $and: [
            { first_name: { $regex: `^${terms[0]}`, $options: "i" } },
            { last_name: { $regex: `^${terms[1]}`, $options: "i" } },
          ],
        },
        {
          $and: [
            { first_name: { $regex: `^${terms[1]}`, $options: "i" } },
            { last_name: { $regex: `^${terms[0]}`, $options: "i" } },
          ],
        },
      ],
    };
  }

  try {
    const users = await User.find(expression).select(
      "first_name last_name pfp"
    );
    res.json(users);
  } catch (err) {
    res.json({ msg: err.message || err });
  }
};

/* GET people you may know */
// input: req.user
// output: [{ first_name, last_name, pfp }, ...]
exports.people_may_know_get = [
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      const friends = (
        await UserRelationship.find({
          relating_user: req.user._id,
          status: "Friends",
        })
      ).map((rel) => rel.related_user._id);

      const users = await User.aggregate([
        {
          $match: { _id: { $nin: [...friends, req.user._id] } },
        },
        { $sample: { size: 15 } },
        { $project: { first_name: true, last_name: true, pfp: true } },
      ]);

      res.json(users);
    } catch (err) {
      res.json({ msg: err.message || err });
    }
  },
];
