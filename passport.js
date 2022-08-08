const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookTokenStrategy = require("passport-facebook-token");
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

passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env["FACEBOOK_APP_ID"],
      clientSecret: process.env["FACEBOOK_APP_SECRET"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      const first_name = profile.name.givenName;
      const last_name = profile.name.familyName;

      let user = await User.findOne({ username: profile.id });
      if (!user) {
        user = {
          username: profile.id,
          first_name,
          last_name,
          pfp: profile.photos[0].value,
        };
        user = await new User(user).save();
      }

      cb(null, user, accessToken);
    }
  )
);

module.exports = passport;
