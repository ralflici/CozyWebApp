const express = require('express');
const router = express.Router();
const path = require('path');

//router.use(express.static(path.join(__dirname, '..', 'public')));
router.get("/", function(req, res, next) {
  res.statusCode = 200;
  res.send();
});
router.get('/index', function(req, res, next) {
  res.redirect("/");
})
module.exports = router;
