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
 *            description: Provide the type of what you are searching for. Hint >> type >> (track)
 *          - in: query
 *            name: q
 *            schema:
 *              type: string
 *            description: The name of the song or artist
 *      responses:
 *          200:
 *              description: Display all tracks by name/artist name
 *          400:
 *              description: Bad Request
 *        
 */
    
    searchRouter.get("/", searchHandler.search);
    
    return searchRouter;
  })();
