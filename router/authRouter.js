const express = require("express");
const authHandler = require("../controller/AuthController");
const passport = require("passport");

//authRouter
exports.router = (() => {
  const authRouter = express.Router();

/**
 * @swagger
 * /api/auth:
 *  get:
 *      tags:
 *        - Authentication
 *      description: Checks if the user is Authenticated
 *      security:
 *        JWT:
 *            type: apiKey
 *            name: Authorization
 *            in: header
 *      responses:
 *          200:
 *              description: Sends back authenticated user object
 *          401:
 *              description: Requires Authentication
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
