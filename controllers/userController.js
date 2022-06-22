const User = require("../models/user");
const { body, validationResult } = require("express-validator");

/* GET specific user */
exports.user_get = async function (req, res, next) {
  try {
    const user = await User.findById(req.params.userId).populate(
      "first_name last_name username pfp"
    );
    res.json(user);
  } catch (err) {
    res.json({ error: err.message || err });
  }
};

/* POST create user */
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
          error: "User with username `" + username + "` already exists",
        });
        return;
      }

      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
        }
        const user = new User({
          first_name,
          last_name,
          username,
          password: hashedPassword,
          pfp,
        });
        // Save user
        res.json(await user.save());
      });
    } catch (err) {
      res.json(err);
    }
  },
];
