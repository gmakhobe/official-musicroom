const express = require("express");
const authHandler = require("../controller/AuthController");
const passport = require("passport");

//authRouter
exports.router = (() => {
  const authRouter = express.Router();
  
  authRouter.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    authHandler.isAuthenticated
  );
  
  authRouter.get("/logout", authHandler.logout);
  
  authRouter.get(
    "/login/facebook",
    passport.authenticate("facebook", { scope: ["email"] })
  );
  authRouter.get(
    "/link/facebook",
    passport.authorize("facebook", { scope: ["email"] })
  );

  authRouter.get(
    "/login/facebook/callback",
    passport.authenticate("facebook", {
      session: false,
    }),
    authHandler.connect
  );

  authRouter.get(
    "/link/facebook/callback",
    passport.authorize("facebook", {
      session: false,
    }),
    authHandler.connect
  );

  authRouter.get(
    "/login/google",
    passport.authenticate("google", {
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    })
  );

  authRouter.get(
    "/link/google",
    passport.authorize("google", {
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    })
  );

  authRouter.get(
    "/login/google/callback",
    passport.authenticate("google", {
      session: false,
    }),
    authHandler.connect
  );

  authRouter.get(
    "/link/google/callback",
    passport.authorize("google", {
      session: false,
    }),
    authHandler.connect
  );

  authRouter.get(
    "/login/deezer",
    passport.authenticate("deezer", {scope: ['basic_access', 'email' , 'offline_access', 'manage_library', 'manage_community', 'delete_library', 'listening_history']})
  );

  authRouter.get(
    "/link/deezer",
    passport.authorize("deezer", {scope: ['basic_access', 'email' , 'offline_access', 'manage_library', 'manage_community', 'delete_library', 'listening_history']})
  );

  authRouter.get(
    "/login/deezer/callback",
    passport.authenticate("deezer", {
      session: false,
    }),
    authHandler.connect
  );

  authRouter.get(
    "/link/deezer/callback",
    passport.authorize("deezer", {
      session: false,
    }),
    authHandler.connect
  );

  return authRouter;
})();
