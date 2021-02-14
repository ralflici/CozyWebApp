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
});

router.get("/log.html", isLogged ,function(req, res, next) { res.sendFile(path.join(__dirname, '..', 'public', 'views', 'log.html')); });
router.post("/login", logIn);
router.post("/signup", signUp);

function isLogged(req, res, next) {
  next();
}
function logIn(req, res, next) {

}
function signUp(req, res, next) {

}

module.exports = router;
