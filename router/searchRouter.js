const express = require("express");
const searchHandler = require("../controller/SearchController");


exports.router = (() => {
    const searchRouter = express.Router();
    
    searchRouter.get("/", searchHandler.search);
    
    return searchRouter;
  })();
