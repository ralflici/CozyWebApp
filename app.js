#! /usr/bin/env node
"use strict";

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require("mongoose");
var fs = require('fs');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var locationsRouter = require("./routes/locations");
var errorRouter = require('./routes/error');

var app = express();

// Create the default connection to the database
var mongoDB_URL = fs.readFileSync("./utilities/mongoDB.txt", "utf8");
mongoose.connect(mongoDB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error: "));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use("/locations", locationsRouter);
app.use(/[\s\S]*/, errorRouter);

// Importable by the /bin/www file
module.exports = app;
