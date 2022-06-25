const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");

/* POST login. */
// input: username, password
// output: { user, token }
router.post("/login", function (req, res, next) {
  passport.authenticate(
    "local",
    {
      session: false,
    },
    (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          msg: "Something is not right",
          user: user,
          info: info.message,
        });
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }

        // generate a signed json web token with the contents of user object and return it in the response
        const token = jwt.sign({ id: user._id }, "your_jwt_secret");
        return res.json({ user, token });
      });
    }
  )(req, res);
});

module.exports = router;
