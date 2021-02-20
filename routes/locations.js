"use strict";

var express = require("express");
var router = express.Router();
var location_controller = require("../controllers/locationController");

router.get("/", location_controller.locationsList);
router.post("/name", location_controller.locationsName);
router.post("/continent", location_controller.locationsContinent);

module.exports = router;