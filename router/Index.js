const express = require("express");
const router = express.Router();
const indexRouter = require("../controller/IndexController");

// On get request 
router.get("/", indexRouter.LandingPage);
router.get("/login", indexRouter.LoginPage);
router.get("/profile", indexRouter.ProfilePage);
router.get("/explore", indexRouter.ExplorePage);
router.get("/search", indexRouter.SearchPage);
router.get("/playlist/private/:id", indexRouter.PrivatePlalistPage);
router.get("/playlist/public/:id", indexRouter.PrivatePlalistPage);

// On post request

module.exports = router;