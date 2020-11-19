const express = require("express");
const passport = require("passport");
const controllerPlaylist = require("../controller/PlaylistController");


exports.router = (() => {
  const playlistRouter = express.Router();

/**
 * @swagger
 * /api/playlist:
 *  get:
 *      tags:
 *        - Playlists
 *      description: Gets all private and public playlists
 *      responses:
 *          200:
 *              description: Returns an object of playlists
 *          401:
 *              description: Requires Authentication
 */

 /**
 * @swagger
 * /api/playlist:
 *  put:
 *      tags:
 *        - Playlists
 *      description: Modifies the playlist by adding users on to private playlist
 *      responses:
 *          200:
 *              description: Playlist Modified successfully
 *          401:
 *              description: Requires Authentication
 */

  /**
 * @swagger
 * /api/playlist:
 *  post:
 *      tags:
 *        - Playlists
 *      description: Creates a new playlist
 *      parameters:
 *          - in: query
 *            name: title
 *            schema:
 *              type: string
 *            description: Name of the playlist
 *          - in: query
 *            name: type
 *            schema:
 *              type: string
 *            description: Visibility (Public/Private)
 *      responses:
 *          200:
 *              description: Playlist created successfully
 *          401:
 *              description: Requires Authentication
 */

  playlistRouter.get(
    "/",
	passport.authenticate("jwt", { session: false }),
	controllerPlaylist.getPlaylists
  );


  return playlistRouter;
})();
