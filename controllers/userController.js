"use strict";

const jwt = require("jsonwebtoken");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const SHA256 = require("crypto-js/sha256");

exports.verifyJWT = function(req, res, next) {
    // save the destination url for later use
    let dest = req.url;
    res.locals.dest = dest.slice(dest.lastIndexOf("/"));

    let accessToken;
    // search for the authorization header
    if (req.headers.authorization) {
        accessToken = req.headers.authorization.split("Bearer ")[1];
    }
    // otherwise search in the URL parameters
    else if (req.params.jwt) {
        accessToken = req.params.jwt;
    }
    // otherwise search in the body (only for the form relative to 'edit-picture')
    else if (req.body.jwt) {
        accessToken = req.body.jwt.split("Bearer ")[1];
    }
    //console.log("\x1b[32m", "*** authorization", accessToken);

    // jwt not found or overridden
    if(accessToken == undefined || accessToken == "0") {
        res.statusCode = 401;
        next();
    }
    // jwt found
    else {
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async function(err, payload) {
            // jwt not valid
            if(err) {
                res.statusCode = 401;
                next();
                return;
            }
            
            // jwt valid
            // save user and user's id for later use
            res.locals.userID = payload.id;
            try {
                res.locals.user = await User.findById(payload.id, "password name email location bio pic admin");
            } catch(err) {
                res.status(500).send(err);
                return;
            }
            

            // if the user is an admin save his access token to redirect him to the admin page
            if (res.locals.user.admin) {
                res.locals.jwt = accessToken;
                res.statusCode = 401;
            }
            else {
                res.statusCode = 200;
            }
            next();
        });
    }
};

exports.getInfo = function(req, res, next) {
    res.send(res.locals.user);
};

exports.getUserByID = async function(id) {
    try{
        const user = await User.findById(id);
        return user;
    } 
    catch(err) {
        throw err;
    } 
};

exports.editProfile = async function(req, res, next) {
    const user = res.locals.user;
    user.name = req.body.name;
    user.email = req.body.email;
    user.location = req.body.location;
    user.bio = req.body.bio;
    try {
        await user.save();
    } catch(err) {
        res.status(500).send(err);
        return;
    }
    res.redirect("back");
};

exports.editPicture = function (req, res, next) {
    // if the user is not authorized
    if (res.statusCode === 401) {
        // remove the uploaded image from the local 'uploads' directory
        fs.unlink('uploads/' + req.file.filename, (err) => {
            if (err) throw err;
        });
        // redirect to log-in page
        res.redirect("/log.html");
        return;
    }
    
    const user = res.locals.user;
    // read the image with Jimp, resize and compress it
    Jimp
    .read(path.join(__dirname + "/..", "/uploads", req.file.filename))
    .then(async function(image) {
        let data;
        try {
            data = await image.cover(250,250).quality(70).getBase64Async(req.file.mimetype);
        } catch(err) {
            res.status(500).send(err);
            return;
        }
        // save the image in the user's document
        user.pic = {
            data: data,
            contentType: req.file.mimetype,
            filename: req.file.filename
        }
        try {
            await user.save();
        } catch(err) {
            res.status(500).send(err);
            return;
        }
        // remove the uploaded image from the local 'uploads' directory
        fs.unlink('uploads/' + req.file.filename, (err) => {
            if (err) throw err;
        });
        res.status(200);
        res.redirect("./profile.html");
    })
    .catch(err => {
        res.status(500).send(err);
    });
};

exports.getPic = function(req, res, next) {
    const user = res.locals.user;
    if (user != null && user.pic.data != null) {
        res.writeHead(200, {
            'Content-Type': user.pic.contentType,
            'Content-disposition': 'attachment;filename=' + user.pic.filename,
            'Content-Length': user.pic.data.length
        });
        res.end(user.pic.data);
    }
    res.send();
};

exports.changePassword = async function(req, res, next) {
    const user = res.locals.user;
    // check if the old password is right
    if (SHA256(req.body.oldPass).toString() === res.locals.user.password) {
        // encrypt the new password and save it
        user.password = SHA256(req.body.newPass).toString();
        try {
            await user.save();
        } catch(err) {
            res.status(500).send(err);
            return;
        }
        res.status(200);
        res.send({ message: "Password changed successfully" });
    }
    // otherwise send error
    else {
        res.status(401);
        res.send({ message: "Invalid old password" });
    }
};

exports.deleteAccount = function(req, res, next) {
    User.findByIdAndDelete(res.locals.userID, function(err, doc) {
        if (err) {
            res.status(500);
            res.send({ message: "Could not delete the account" });
        }
        else {
            console.log("Account deleted");
            // override the jwt cookie
            res.cookie("jwt", "0");
            res.statusCode = 200;
            res.redirect("log.html");
        }
    });
}