const express = require("express");
const router = express.Router();
const indexRouter = require("../controller/IndexController");

// On get request 
router.get("/", indexRouter.LandingPage);

module.exports = router;