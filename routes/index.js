const express = require('express');
const router = express.Router();
const path = require('path');

//router.use(express.static(path.join(__dirname, '..', 'public')));
router.get("/", function(req, res, next) {
  res.sendStatus(200);
});
router.get('/index', function(req, res, next) {
  res.redirect("/");
})
module.exports = router;
