const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require("./models/user");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(function (username, password, cb) {
    username = username.toLowerCase();
    return User.findOne({ username })
      .then((user) => {
        if (!user) {
          return cb(null, false, {
            message: "Incorrect username.",
          });
        }

        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            // passwords match! log user in
            const resUser = {
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              pfp: user.pfp,
              _id: user._id,
            };
            return cb(null, resUser, { message: "Logged in successfully" });
          } else {
            // passwords do not match!
            return cb(null, false, { message: "Incorrect password" });
          }
        });
      })
      .catch((err) => cb(err));
  })
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    function (jwtPayload, cb) {
      return User.findById(jwtPayload.id, "-password")
        .then((user) => {
          return cb(null, user);
        })
        .catch((err) => {
          return cb(err);
        });
    }
  )
);

module.exports = passport;
