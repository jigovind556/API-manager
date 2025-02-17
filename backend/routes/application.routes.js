const { Router } = require("express");
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  deleteApplication,
} = require("../controllers/application.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = Router();

router
  .route("/")
  .post(verifyJWT, createApplication)
  .get(verifyJWT, getAllApplications);

router
  .route("/:id")
  .get(verifyJWT, getApplicationById)
  .delete(verifyJWT, deleteApplication);

module.exports = router;
