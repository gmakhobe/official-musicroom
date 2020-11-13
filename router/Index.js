const express = require("express");
const router = express.Router();
const indexRouter = require("../controller/IndexController");

// On get request 
router.get("/", indexRouter.LandingPage);
router.get("/login", indexRouter.LoginPage);
router.get("/profile", indexRouter.ProfilePage);
router.get("/explore", indexRouter.ExplorePage);
router.get("/search", indexRouter.SearchPage);

// On post request

module.exports = router;