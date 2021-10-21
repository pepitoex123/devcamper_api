const express = require("express");

const { getBootcamps, getBootcamp,updateBootcamp,deleteBootcamp,createBootcamp,getBootcampsInRadius,bootcampPhotoUpload } = require("./../controllers/bootcamps");
const courseRouter = require("./courses");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

const { protect } = require("./../middleware/auth");

// Re-route into other resource routers

router.use("/:bootcampId/courses",courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/").get(advancedResults(Bootcamp,"courses"),getBootcamps).post(protect,createBootcamp);

router.route("/:id").get(getBootcamp).put(protect,updateBootcamp).delete(protect,deleteBootcamp);

router.route("/:id/photo").put(protect,bootcampPhotoUpload);

module.exports = router