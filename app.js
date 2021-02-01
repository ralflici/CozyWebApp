#! /usr/bin/env node
"use strict";

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const fs = require('fs');
const serveStatic = require("serve-static");

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const locationsRouter = require("./routes/locations");
const placesRouter = require("./routes/places")
const errorRouter = require('./routes/error');

const app = express();

// Create the default connection to the database
var mongoDB_URL = fs.readFileSync("./utilities/mongoDB.txt", "utf8");
mongoose.connect(mongoDB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error: "));

// Middleware  
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '..', 'public', 'images')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function (req, res, next) {
    // check if client sent cookie
    var cookie = req.cookies.cookieName;
    if (cookie === undefined) {
      // no: set a new cookie
      var randomNumber=Math.random().toString();
      randomNumber=randomNumber.substring(2,randomNumber.length);
      res.cookie('cookieName',randomNumber, { maxAge: 900000, httpOnly: true });
      console.log('cookie created successfully');
    } else {
      // yes, cookie was already present 
      console.log('cookie exists', cookie);
    } 
    next(); // <-- important!
});


// Routers
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use("/locations", locationsRouter);
app.use("/places", placesRouter);
app.use(/[\s\S]*/, errorRouter);

// Importable by the /bin/www file
module.exports = app;
