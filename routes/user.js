var express = require('express');
var router = express.Router();
var path = require('path');

router.use(express.static(path.join(__dirname, '..', 'public', 'views')));

router.get('/', function(req, res, next) {
  // if authenticated res.redirect("profile.html");
  // otherwise
  res.redirect("log.html");
});
router.get('/profile.html', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'profile.html'));
});
router.get('/messages.html', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'messages.html'));
});
router.get('/bookings.html', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'bookings.html'));
});
router.get('/log.html', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'log.html'));
});

module.exports = router;
