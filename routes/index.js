"use strict";

const express = require('express');
const router = express.Router();
const path = require('path');
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SHA256 = require("crypto-js/sha256");

router.get('/index', function(req, res, next) {
  res.redirect("/");
});

router.get("/log.html", isLogged ,function(req, res, next) { res.sendFile(path.join(__dirname, '..', 'public', 'views', 'log.html')); });
router.post("/login", logIn);
router.post("/signup", signUp);

// if jwt cookie is valid then the user is already logged in and should be redirected
function isLogged(req, res, next) {
  const accessToken = req.cookies.jwt;

  // cookie exists
  if(accessToken != undefined) {
    // jwt is valid
    try {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      res.redirect("/user/" + accessToken + "/profile.html");
    }
    // jwt is not valid
    catch(err) {
      next();
    }
  }
  // cookie doesn't exist
  else {
    next();
  }
}

async function logIn(req, res, next) {
  // encrypt the data
  const username = SHA256(req.body.username).toString();
  const password = SHA256(req.body.password).toString();

  // search the user in the database
  const user = await User.findOne({username: username, password: password}, "_id admin");
  if (user == null) {
    res.status(401).send({ message: "There are no users with those credentials" });
  }
  else {
    // use the payload to store the user's id
    let payload = {id: user._id};

    // create the access token
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: process.env.ACCESS_TOKEN_LIFE
    });

    // send the access token to the client inside a cookie
    res.cookie("jwt", accessToken);

    // redirect to the right route based on the type of user
    if (user.admin)
      res.redirect("/admin/" + accessToken);
    else
      res.redirect("/user/" + accessToken + "/profile.html");
  }
}

async function signUp(req, res, next) {
  // encrypt the data
  const username = SHA256(req.body.username).toString();
  const password = SHA256(req.body.password).toString();

  // search user with same username
  const userInDB = await User.findOne({username: username});
  // if such user exists or the admin code inserted is wrong send error
  if (userInDB != null || (req.body.admin && req.body.adminCode != process.env.ADMIN_CODE)) {
    res.statusCode = 403;
    res.send();
    return;
  }
  else {
    // create new user and save it in database
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
