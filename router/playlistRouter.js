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
   *      security:
   *        - bearerAuth:[]
   *      responses:
   *          200:
   *              description: Returns an object of playlists
   *          401:
   *              description: Requires Authentication
   */

  playlistRouter.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    controllerPlaylist.getPlaylists
  );

  /**
   * @swagger
   * /api/playlist/user:
   *  put:
   *      tags:
   *        - Playlists
   *      description: Modifies the playlist by adding users on to private playlist
   *      parameters:
   *          - in: body
   *            name: PId
   *            schema:
   *              type: string
   *            description: The Id of the playlist you wish to modify
   *          - in: body
   *            name: newUserId
   *            schema:
   *              type: string
   *            description: The Id of the user you wish to add to playlist
   *          - in: body
   *            name: creatorId
   *            schema:
   *               type: string
   *            description: The Id of the playlist owner you wish to modify
   *          - in: body
   *            name: role
   *            schema:
   *               type: string
   *            description: Read or Read Write permissions you wish to give new user (RW or R)
   *      security:
   *        - bearerAuth:[]
   *      responses:
   *          200:
   *              description: Playlist Modified successfully
   *          401:
   *              description: Requires Authentication
   */
  playlistRouter.put(
    "/user",
    passport.authenticate("jwt", { session: false }),
    controllerPlaylist.addUser
  );

  /**
   * @swagger
   * /api/playlist/deluser:
   *  put:
   *      tags:
   *        - Playlists
   *      description: Modifies the playlist by removing user in private playlist
   *      parameters:
   *          - in: body
   *            name: PId
   *            schema:
   *              type: string
   *            description: The Id of the playlist you wish to modify
   *          - in: body
   *            name: userId
   *            schema:
   *              type: string
   *            description: The Id of the user you wish to remove in playlist
   *          - in: body
   *            name: creatorId
   *            schema:
   *               type: string
   *            description: The Id of the playlist owner
   *      security:
   *        - bearerAuth:[]
   *      responses:
   *          200:
   *              description: Playlist Modified successfully
   *          401:
   *              description: Requires Authentication
   */
  playlistRouter.put("/deluser", controllerPlaylist.delUsers);

  /**
   * @swagger
   * /api/playlist/track:
   *  put:
   *      tags:
   *        - Playlists
   *      description: Modifies the playlist by adding tracks to private playlist
   *      parameters:
   *          - in: body
   *            name: PId
   *            schema:
   *              type: string
   *            description: The Id of the playlist you wish to modify
   *          - in: body
   *            name: userId
   *            schema:
   *              type: string
   *            description: The Id of the user adding the track
   *          - in: body
   *            name: creatorId
   *            schema:
   *               type: string
   *            description: The Id of the playlist owner
   *      security:
   *        - bearerAuth:[]
   *      responses:
   *          200:
   *              description: Playlist Modified successfully
   *          401:
   *              description: Requires Authentication
   */
  playlistRouter.put("/track", controllerPlaylist.addTrack);

  /**
   * @swagger
   * /api/playlist:
   *  post:
   *      tags:
   *        - Playlists
   *      description: Creates a new playlist
   *      security:
   *        - bearerAuth:[]
   *      parameters:
   *          - in: body
   *            name: title
   *            schema:
   *              type: string
   *            description: Name of the playlist
   *          - in: query
   *            name: body
   *            schema:
   *              type: string
   *            description: Visibility (Public/Private)
   *      responses:
   *          200:
   *              description: Playlist created successfully
   *          401:
   *              description: Requires Authentication
   */
  playlistRouter.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    controllerPlaylist.createPlaylist
  );

  return playlistRouter;
})();
