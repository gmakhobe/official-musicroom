const express = require("express");
const passport = require("passport")
const userHandler = require("../controller/UserController");


exports.router = (() => {
  const userRouter = express.Router();
  
  userRouter.get("/all", userHandler.getUsers);


  userRouter.get("/:id", userHandler.getUserById);
  
  userRouter.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    userHandler.putUserById
  );


  userRouter.get("/:username", userHandler.getUserByUsername);

  return userRouter;
})();
