const User = require("../model/UserModel");
const keys = require("../config/keys");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const DeezerStrategy = require("passport-deezer").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const JwtStrategy = require("passport-jwt").Strategy;
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
module.exports = function (passport) {
  /*JWT Strategy for authorization */
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: keys.JWT.secret,
      },
      (payload, done) => {
        User.findById({ _id: payload._id }, (err, user) => {
          if (err) return done(err, false);
          if (user) return done(null, user);
          else return done(null, false);
        });
      }
    )
  );

  /* Facebook Strategy */

  passport.use(
    new FacebookStrategy(
      {
        clientID: keys.FACEBOOK.clientID,
        clientSecret: keys.FACEBOOK.secret,
        callbackURL: "http://localhost:5000/api/auth/login/facebook/callback",
        passReqToCallback: true,
        profileFields: ["id", "emails", "name"],
      },
      function (req, accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          //user is not logged in yet
          if (!req.user) {
            User.findOne(
              {
                $or: [
                  { _facebookId: profile.id },
                  { email: profile.emails[0].value },
                  {
                    username: `${profile.name.givenName}${profile.name.familyName}`,
                  },
                ],
              },
              function (err, user) {
                if (err) return done(err);
                if (user) {
                  if (!user.facebookToken) {
                    user._facebookId = profile.id;
                    user.facebookToken = accessToken;
                    user.save(function (err) {
                      if (err) return done(err);
                    });
                  }
                  return done(null, user);
                } else {
                  console.log("about to create a new user");
                  var newUser = new User();
                  newUser._facebookId = profile.id;
                  newUser.facebookToken = accessToken;
                  newUser.firstname = profile.name.givenName;
                  newUser.lastname = profile.name.familyName;
                  newUser.username = `${profile.name.givenName}${profile.name.familyName}`;
                  newUser.email = profile.emails[0].value;
                  newUser.confirmKey = "confirmed";
                  newUser.save(function (err) {
                    if (err) throw err;
                    return done(null, newUser);
                  });
                }
              }
            );
          } else {
            var user = req.user;
            user._facebookId = profile.id;
            user.facebookToken = accessToken;
            user.save(function (err) {
              if (err) throw err;
              return done(null, user);
            });
          }
        });
      }
    )
  );

  /* Google Strategy */

  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.GOOGLE.clientID,
        clientSecret: keys.GOOGLE.secret,
        callbackURL: "http://localhost:5000/api/auth/login/google/callback",
        passReqToCallback: true,
      },
      function (req, accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          if (!req.user) {
            User.findOne(
              {
                $or: [
                  { _googleId: profile.id },
                  { email: profile.emails[0].value },
                  {
                    username: `${profile.name.givenName}${profile.name.familyName}`,
                  },
                ],
              },
              function (err, user) {
                if (err) return done(err);
                if (user) {
                  if (!user.googleToken) {
                    user._googleId = profile.id;
                    user.googleToken = accessToken;
                    user.save(function (err) {
                      if (err) return done(err);
                    });
                  }
                  return done(null, user);
                } else {
                  //include check for email in db
                  var newUser = new User();
                  newUser._googleId = profile.id;
                  newUser.googleToken = accessToken;
                  newUser.firstname = profile.name.givenName;
                  newUser.lastname = profile.name.familyName;
                  newUser.username = !profile.username
                    ? profile.displayName
                    : profile.username;
                  newUser.email = profile.emails[0].value;
                  newUser.confirmKey = "confirmed";

                  newUser.save(function (err) {
                    if (err) throw err;
                    return done(null, newUser);
                  });
                }
              }
            );
          } else {
            var user = req.user;
            user._googleId = profile.id;
            user.googleToken = accessToken;

            user.save(function (err) {
              if (err) throw err;
              return done(null, user);
            });
          }
        });
      }
    )
  );

  /* Deezer Strategy */
  passport.use(
    new DeezerStrategy(
      {
        clientID: keys.DEEZER.clientID,
        clientSecret: keys.DEEZER.secret,
        callbackURL: "http://localhost:5000/api/auth/login/deezer/callback",
        passReqToCallback: true,
      },
      function (req, accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
          if (!req.user) {
            User.findOne(
              {
                $or: [
                  { _deezerId: profile.id },
                  { email: profile.emails[0].value },
                  {
                    username: `${profile.name.givenName}${profile.name.familyName}`,
                  },
                ],
              },
              function (err, user) {
                if (err) return done(err);
                if (user) {
                  if (!user.deezerToken) {
                    user._deezerId = profile.id;
                    user.deezerToken = accessToken;
                    user.save(function (err) {
                      if (err) return done(err);
                    });
                  }
                  return done(null, user);
                } else {
                  var newUser = new User();
                  newUser._deezerId = profile.id;
                  newUser.deezerToken = accessToken;
                  newUser.firstname = profile.name.givenName;
                  newUser.lastname = profile.name.familyName;
                  newUser.username = `${profile.name.givenName}${profile.name.familyName}`;
                  newUser.email = profile.emails[0].value;
                  newUser.confirmKey = "confirmed";

                  newUser.save(function (err) {
                    if (err) throw err;
                    return done(null, newUser);
                  });
                }
              }
            );
          } else {
            var user = req.user;
            user._deezerId = profile.id;
            user.deezerToken = accessToken;

            user.save(function (err) {
              if (err) throw err;
              return done(null, user);
            });
          }
        });
      }
    )
  );

  /* set session cookie */
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  /* takes session cookie and gets user */
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
