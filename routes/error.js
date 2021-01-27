var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
    res.send("Error 404");
})

module.exports = router;