const express = require("express");
const searchHandler = require("../controller/SearchController");


exports.router = (() => {
    const searchRouter = express.Router();

/**
 * @swagger
 * /api/search:
 *  get:
 *      tags:
 *        - Search
 *      description: Track search
 *      parameters:
 *          - in: query
 *            name: type
 *            schema:
 *              type: string
 *            description: Search by providing the name of the artist or name of the song
 *          - in: query
 *            name: q
 *            schema:
 *              type: string
 *            description: Provide the search type, which is Track
 *      responses:
 *          200:
 *              description: Display all tracks by name/artist name
 *          401:
 *              description: Requires Authentication
 */
    
    searchRouter.get("/", searchHandler.search);
    
    return searchRouter;
  })();
