const express = require("express");
const passport = require("passport");
const controllerPlaylist = require("../controller/PlaylistController");


exports.router = (() => {
  const playlistRouter = express.Router();

/**
 * @swagger
 * /api/playlist:
 *  get:
 *      description: Gets all private and public playlists
 *      responses:
 *          200:
 *              description: display playlists
 *          401:
 *              description: requires authentication
 */

 /**
 * @swagger
 * /api/playlist:
 *  post:
 *      description: creates a new playlist
 *      responses:
 *          200:
 *              description: playlist is created successfully
 *          401:
 *              description: requires authentication
 */

 /**
 * @swagger
 * /api/playlist:
 *  put:
 *      description: modifies the playlist by adding users on to private playlist
 *      responses:
 *          200:
 *              description: playlist modified successfully
 *          401:
 *              description: requires authentication
 */

  playlistRouter.get(
    "/",
	passport.authenticate("jwt", { session: false }),
	controllerPlaylist.getPlaylists
  );


  return playlistRouter;
})();
