"use strict";

var express = require("express");
var router = express.Router();
var location_controller = require("../controllers/locationController");

router.get("/", location_controller.locationsList);
router.get("/name/:data", location_controller.locationsName);
router.get("/continent/:data", location_controller.locationsContinent);

module.exports = router;