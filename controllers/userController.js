const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");

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
