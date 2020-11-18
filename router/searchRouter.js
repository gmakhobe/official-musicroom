const express = require("express");
const searchHandler = require("../controller/SearchController");


exports.router = (() => {
    const searchRouter = express.Router();

    /**
 * @swagger
 * /api/search:
 *  get:
 *      description: Searches the track by name
 *      responses:
 *          200:
 *              description: display all tracks by name/artist name
 *          401:
 *              description: requires authentication
 */
    
    searchRouter.get("/", searchHandler.search);
    
    return searchRouter;
  })();
