"use strict";

const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.verify = function(req, res, next) {
    let accessToken;
    // search for the authorization header
    if (req.headers.authorization) {
        //console.log("\x1b[35m", "HEADER FOUND");
        accessToken = req.headers.authorization.split("Bearer ")[1];
    }
    // otherwise search in the URL parameters
    else if (req.params.jwt) {
        //console.log("\x1b[36m", "PARAM FOUND");
        accessToken = req.params.jwt;
    }
    
    // jwt not found or overridden
    if(accessToken == undefined || accessToken == "0") {
        //console.log("\x1b[31m", "jwt not found");
        res.statusCode = 401;
        next();
    }
    // jwt found
    else {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async function(err, payload) {
            // jwt not valid
            if (err) {
                //console.log("\x1b[31m", "jwt not valid");
                res.statusCode = 401;
                next();
                return;
            }
            
            // jwt valid
            // save user's id for later use
            res.locals.userID = payload.id;
            //console.log("\x1b[31m", "jwt valid");
            
            // find the user and check if he's admin
            const user = await User.findById(payload.id, "password name email location bio pic admin");
            if (!user.admin)
                res.statusCode = 401;
            else {
                res.locals.user = user;
                res.statusCode = 200;
            }
            next();
        });
    }
}