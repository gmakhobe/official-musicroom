const express = require("express");
const passport = require("passport");
const controllerPlaylist = require("../controller/PlaylistController");


exports.router = (() => {
  const playlistRouter = express.Router();

  playlistRouter.get(
    "/",
	passport.authenticate("jwt", { session: false }),
	controllerPlaylist.getPlaylists
  );


  return playlistRouter;
})();
