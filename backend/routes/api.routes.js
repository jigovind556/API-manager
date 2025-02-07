const { Router } = require("express");
const {
  createApi,
  getAllApis,
  getApiById,
  updateApi,
  deleteApi,
} = require("../controllers/api.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = Router();

router
  .route("/")
  .post(verifyJWT, createApi)
  .get(verifyJWT, getAllApis);
router
  .route("/:id")
  .get(verifyJWT, getApiById)
  .put(verifyJWT, updateApi)
  .delete(verifyJWT, deleteApi);

module.exports = router;
