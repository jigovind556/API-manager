const { Router } = require("express");
const { getAppOptions } = require("../controllers/appOptions.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", verifyJWT, getAppOptions);

module.exports = router;
