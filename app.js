#! /usr/bin/env node
"use strict";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const favicon = require('serve-favicon');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const locationsRouter = require("./routes/locations");
const placesRouter = require("./routes/places")
const errorRouter = require('./routes/error');

const app = express();

// Create the default connection to the database
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error: "));

// Middleware
/*
let setCache = function (req, res, next) {
  // here you can define period in second
  const period = 31536000;

  // you only want to cache for GET requests
  if (req.method == 'GET') {
    res.set('Cache-control', 'immutable');
  } 
  else {
    // for the other requests set strict no caching parameters
    res.set('Cache-control', `no-cache`);
  }
  next();
}*/

//app.use(setCache);
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))//, setCache)
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(path.join(__dirname, 'public', 'images')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* COOKIE DEBUG
app.use(function(req,res,next) {
  const cookie = req.cookies.jwt;
  if (cookie == null) {
    //const random = require("crypto").randomBytes(16).toString("hex");
    //res.cookie('jwt', random, { maxAge: 900000, httpOnly: true });
    console.log("jwt cookie doesn't exsist");
  }
  else
    console.log("jwt cookie exists:", cookie);
  next();
})
*/

// Routers

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use("/locations", locationsRouter);
app.use("/places", placesRouter);
//app.use(/[\s\S]*/, errorRouter);


// Importable by the /bin/www file
module.exports = app;
