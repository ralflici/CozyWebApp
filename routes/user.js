const express = require('express');
const router = express.Router();
const path = require('path');

router.use(express.static(path.join(__dirname, '..', 'public', 'views')));
router.get("/profile", function(req,res,next) {
  res.redirect("profile.html");
});
router.get("/messages", function(req,res,next) {
  res.redirect("messages.html");
});
router.get("/bookings", function(req,res,next) {
  res.redirect("bookings.html");
});
router.get("/log", function(req,res,next) {
  res.redirect("log.html");
});
/*
router.get('/profile', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'profile.html'));
});
router.get('/messages', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'messages.html'));
});
router.get('/bookings', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'bookings.html'));
});
router.get('/log', function(req, res, next) {
  router.use(serveStatic("public/views", {"log" : "log.html"}));
});*/

module.exports = router;
