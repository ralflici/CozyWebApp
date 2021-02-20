"use strict";

const express = require("express");
const path = require("path")
const router = express.Router();

router.get("/", function(req, res) {
    res.statusCode = 404;
    res.sendFile(path.join(__dirname, "..", "public", "views", "error.html"));
})

module.exports = router;