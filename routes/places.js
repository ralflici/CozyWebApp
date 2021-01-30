var express = require("express");
var router = express.Router();
var place_controller = require("../controllers/placeController");

router.get("/", place_controller.places_list);
router.post("/outmost_price", place_controller.outmost_price);
router.post("/submit", place_controller.places_list_filter);

module.exports = router;