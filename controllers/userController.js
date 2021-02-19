const jwt = require("jsonwebtoken");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");
const SHA256 = require("crypto-js/sha256");
/*
exports.verifyJWT = async function(req, res, next) {
    const accessToken = req.cookies.jwt;

    if(accessToken == undefined || accessToken == "0") {
        console.log("\x1b[31m", "jwt not found");
        res.statusCode = 401;
        next();
        return;
        //res.send("You must <a href='log.html'>authenticate</a>");
        //res.redirect("/user/log.html");
    }
    else {
        let payload; 
        try {
            payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            res.locals.userID = payload.id;
            res.locals.user = await User.findById(payload.id, "password name email location bio pic");
            res.statusCode = 200;
        }
        catch(err) {
            console.log("\x1b[31m", "jwt not valid");
            res.statusCode = 401;
            //res.redirect(path.join(__dirname, "..", "public", "views", "log.html"));
        }
        next();
        return;
    }
};
*/
exports.verifyJWT2 = async function(req, res, next) {
    let dest = req.url;
    res.locals.dest = dest.slice(dest.lastIndexOf("/"));

    let accessToken;
    if (req.headers.authorization) {
        console.log("\x1b[35m", "HEADER FOUND");
        accessToken = req.headers.authorization.split("Bearer ")[1];
    }
    else if (req.params.jwt) {
        console.log("\x1b[36m", "PARAM FOUND");
        accessToken = req.params.jwt;
    }
    console.log("\x1b[32m", "*** authorization", accessToken);

    if(accessToken == undefined || accessToken == "0") {
        console.log("\x1b[31m", "jwt not found");
        res.statusCode = 401;
        //return res.send("Access token not found");
    }
    else {
        let payload; 
        try {
            payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            console.log("\x1b[31m", "jwt valid");
            res.locals.userID = payload.id;
            res.locals.user = await User.findById(payload.id, "password name email location bio pic admin");
            if (res.locals.user.admin) {
                res.locals.jwt = accessToken;
                res.statusCode = 401;
            }
            else {
                res.statusCode = 200;
            }
            //return res.send("Authorized");
        }
        catch(err) {
            console.log("\x1b[31m", "jwt not valid");
            res.statusCode = 401;
            //return res.send("Access token not valid");
        }
    }
    next();
};

exports.signup = async function(req, res, next) {
    const username = SHA256(req.body.username).toString();
    const password = SHA256(req.body.password).toString();
    console.log(username, password);
    const userInDB = await User.findOne({username: username});
    console.log(userInDB);
    if (userInDB != null) {
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
};
/*
exports.login = async function(req, res, next){
    console.log(req.body.username, req.body.password);
    const username = SHA256(req.body.username).toString();
    const password = SHA256(req.body.password).toString();
    console.log(SHA256(req.body.username).toString(), SHA256(req.body.password).toString());
    let user = await User.findOne({username: username, password: password}, "_id");
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
        res.redirect("/user/" + accessToken + "/profile.html");
    }
};*/

/*
exports.isLogged = function(req, res, next) {
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
};*/

exports.getInfo = function(req, res, next) {
    res.send(res.locals.user);
};

exports.editProfile = function(req, res, next) {
    const user = res.locals.user;
    user.name = req.body.name;
    user.email = req.body.email;
    user.location = req.body.location;
    user.bio = req.body.bio;
    user.save();
    res.redirect("back");
};

exports.editPicture = function (req, res, next) {
    const user = res.locals.user;
    Jimp.read(path.join(__dirname + "/..", "/uploads", req.file.filename))
    .then(async function(image) {
        const data = await image.cover(250,250).quality(70).getBase64Async(req.file.mimetype);
        user.pic = {
            data: data,
            contentType: req.file.mimetype,
            filename: req.file.filename
        }
        await user.save();
        fs.unlink('uploads/' + req.file.filename, (err) => {
            if (err) throw err;
        });
        res.status(200);
        res.redirect("./profile.html");
    })
    .catch(err => {throw err;}); 
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
    /*
    else {
        res.send();
    }*/
};

exports.changePassword = async function(req, res, next) {
    const user = res.locals.user;
    console.log("Current pass:", res.locals.user.password);
    console.log("Old pass:", SHA256(req.body.oldPass).toString());
    if (SHA256(req.body.oldPass).toString() === res.locals.user.password) {
        user.password = SHA256(req.body.newPass).toString();
        await user.save();
        res.status(200);
        res.send({ message: "Password changed succesfully" });
    }
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
            res.cookie("jwt", "0");
            res.statusCode = 200;
            res.redirect("log.html");
        }
    });
}
/*
exports.logout = function(req, res, next) {
    res.cookie("jwt", "0");
    res.redirect("log.html");
}*/