const express = require("express");
const passport = require("passport")
const userHandler = require("../controller/UserController");


exports.router = (() => {
  const userRouter = express.Router();
  
/**
 * @swagger
 * paths:
 *    /api/user/all:
 *      get:
 *          tags:
 *            - Users
 *          description: Gets all users in the database
 *          responses:
 *              200:
 *                  description: display all the users in the database
 */

  userRouter.get("/all", userHandler.getUsers);

  /**
 * @swagger
 * /api/user/{id}:
 *  get:
 *      tags:
 *        - Users
 *      description: gets user by id
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *              type: integer
 *          required: true
 *      responses:
 *          200:
 *              description: gets the user details using the user id
 *          401:
 *              description: Requires Ruthentication
 */

  userRouter.get("/:id", userHandler.getUserById);

/**
 * @swagger
 * /api/user/:id:
 *  put:
 *      tags:
 *        - Users
 *      description: Updates user details
 *      responses:
 *          200:
 *              description: Returns a response success
 *          401:
 *              description: Requires Ruthentication
 */
  
  userRouter.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    userHandler.putUserById
  );


  userRouter.get("/:username", userHandler.getUserByUsername);

  return userRouter;
})();
