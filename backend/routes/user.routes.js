const { Router } = require("express");
const { registerUser, loginUser, logoutUser, refreshAccessToken } = require("../controllers/user.controller.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// secured route 

router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh_token").post(refreshAccessToken);


module.exports = router;