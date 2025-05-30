const { Router } = require("express");
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  deleteApplication,
  updateApplication,
  getApplicationList,
} = require("../controllers/application.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = Router();

router
  .route("/")
  .post(verifyJWT, createApplication)
  .get(verifyJWT, getAllApplications);

router.get("/list", verifyJWT, getApplicationList);

router
  .route("/:id")
  .get(verifyJWT, getApplicationById)
  .put(verifyJWT, updateApplication)
  .delete(verifyJWT, deleteApplication);

module.exports = router;
