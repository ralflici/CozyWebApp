var express = require("express");
var router = express.Router();
var location_controller = require("../controllers/locationController");

router.get("/", location_controller.locations_list);
router.post("/name", location_controller.locations_name);
router.post("/continent", location_controller.locations_continent);

module.exports = router;