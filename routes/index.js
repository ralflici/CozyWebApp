const express = require('express');
const router = express.Router();
const path = require('path');
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SHA256 = require("crypto-js/sha256");

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
  const accessToken = req.cookies.jwt;
  console.log("\x1b[31m", "cookie", accessToken);

  if(accessToken != undefined) {
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      //res.statusCode = 200;
      res.redirect("/user/" + accessToken + "/profile.html");
    }
    catch(err) {
      next();
    }
  }
  else {
    next();
  }
}

async function logIn(req, res, next) {
  console.log(req.body.username, req.body.password);
  const username = SHA256(req.body.username).toString();
  const password = SHA256(req.body.password).toString();
  console.log(SHA256(req.body.username).toString(), SHA256(req.body.password).toString());
  const user = await User.findOne({username: username, password: password}, "_id admin");
  if (user == null) {
    res.status(401).send({ message: "There are no users with those credentials" });
  }
  else {
    //use the payload to store information about the user such as username, user role, etc.
    let payload = {id: user._id};

    //create the access token with the shorter lifespan
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_TOKEN_LIFE
    });

    //send the access token to the client inside a cookie
    res.cookie("jwt", accessToken);

    if (user.admin)
      res.redirect("/admin/" + accessToken);
    else
      res.redirect("/user/" + accessToken + "/profile.html");
  }
}

async function signUp(req, res, next) {
  const username = SHA256(req.body.username).toString();
  const password = SHA256(req.body.password).toString();
  const userInDB = await User.findOne({username: username});
  if (userInDB != null || req.body.adminCode != process.env.ADMIN_CODE) {
    res.statusCode = 403;
    res.send();
    return;
  }
  else {
    const user = new User({
      username: username,
      password: password,
      admin: req.body.admin
    });
    user.save(function(err) {
      if (err) throw err;
    });
    res.status(200);
    res.redirect("back");
  }
}

module.exports = router;
