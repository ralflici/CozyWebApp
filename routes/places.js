var express = require("express");
var router = express.Router();
var place_controller = require("../controllers/placeController");

router.get("/", place_controller.places_list);

module.exports = router;