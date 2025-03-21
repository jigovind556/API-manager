//api.routes.js
const { Router } = require("express");
const {
  createApi,
  getAllApis,
  getApiById,
  updateApi,
  deleteApi,
  getApiHistory,
} = require("../controllers/api.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = Router();

router
  .route("/")
  .post(verifyJWT, upload.single("attachment"), createApi)
  .get(verifyJWT, getAllApis);

router.route("/history/:id").get(verifyJWT, getApiHistory);
router.route("/history").get(verifyJWT, getApiHistory);

router
  .route("/:id")
  .get(verifyJWT, getApiById)
  .put(verifyJWT, upload.single("attachment"), updateApi)
  .delete(verifyJWT, deleteApi);

module.exports = router;
