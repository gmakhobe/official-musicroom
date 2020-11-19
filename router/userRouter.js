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
 *          security:
 *            - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Display all the users in the database
 *              401:
 *                  description: Unauthorised Access
 */

  userRouter.get("/all", passport.authenticate("jwt", { session: false }),userHandler.getUsers);

  /**
 * @swagger
 * /api/user/{id}:
 *  get:
 *      tags:
 *        - Users
 *      description: gets user by id
 *      security:
 *        - bearerAuth:[]
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

  userRouter.get("/:id", passport.authenticate("jwt", { session: false }),userHandler.getUserById);

/**
 * @swagger
 * /api/user/:id:
 *  put:
 *      tags:
 *        - Users
 *      description: Updates user details
 *      parameters:
 *        - in: body
 *          name: firstname
 *          schema:
 *            type: string
 *          description: Updates the firstname
 *        - in: body
 *          name: lastname
 *          schema:
 *            type: string
 *          description: Updates the lastname
 *        - in: body
 *          name: username
 *          schema:
 *            type: string
 *          description: Updates the username
 *        - in: body
 *          name: email
 *          schema:
 *            type: string
 *          description: Updates the email address
 *      security:
 *        - bearerAuth:[]
 *      responses:
 *          200:
 *              description: Returns a response success
 *          401:
 *              description: Requires Authentication
 */
  
  userRouter.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    userHandler.putUserById
  );


  userRouter.get("/:username", passport.authenticate("jwt", { session: false }),userHandler.getUserByUsername);

  return userRouter;
})();
