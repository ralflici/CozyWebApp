var express = require("express");
var router = express.Router();
var location_controller = require("../controllers/locationController");

router.get("/", location_controller.location_list);

module.exports = router;