const { Router } = require("express");
const {
  getAppOptions,
  createAppOption,
} = require("../controllers/appOptions.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", verifyJWT, getAppOptions).post("/", verifyJWT, createAppOption);

module.exports = router;
