const express = require("express");
const authHandler = require("../controller/AuthController");
const passport = require("passport");

//authRouter
exports.router = (() => {
  const authRouter = express.Router();

  /**
   * @api {GET} /api/auth Check user auth status
   * @apiName isAuthenticated
   * @apiGroup Authentication
   *
   * @apiDescription Checks if current user is authenticated
   *
   * @apiSuccess {Boolean} auth authenticated status.
   * @apiSuccess {Object} user user object from bd.
   */

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
    "/login/facebook/callback",
    passport.authenticate("facebook", {
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
    "/login/google/callback",
    passport.authenticate("google", {
      session: false,
    }),
    authHandler.connect
  );

  authRouter.get(
    "/login/deezer",
    passport.authenticate("deezer", {
      scope: [
        "basic_access",
        "email",
        "offline_access",
        "manage_library",
        "manage_community",
        "delete_library",
        "listening_history",
      ],
    })
  );

  authRouter.get(
    "/link/deezer",
    passport.authorize("deezer", {
      scope: [
        "basic_access",
        "email",
        "offline_access",
        "manage_library",
        "manage_community",
        "delete_library",
        "listening_history",
      ],
    })
  );

  authRouter.get(
    "/login/deezer/callback",
    passport.authenticate("deezer", {
      session: false,
    }),
    authHandler.connect
  );

  authRouter.get('/unlink/deezer/:userId',  authHandler.unlink)

  return authRouter;
})();
