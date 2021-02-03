const jwt = require("jsonwebtoken");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

exports.signup = async function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    console.log(username, password);
    const userInDB = await User.findOne({username: username});
    if (userInDB != undefined)
        res.status(401);
    else {
        const user = new User({
            username: username,
            password: password
        });
        user.save(function(err) {
            if (err) throw err;
        });
        res.status(200);
    }
    res.send();
}

exports.login = async function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    console.log("Request: " + username + " " + password);
    let user = await User.findOne({username: username, password: password}, "_id refreshToken");
    console.log(user);
    if (!user){
        return res.status(401).send();
    }

    //use the payload to store information about the user such as username, user role, etc.
    let payload = {id: user._id};

    //create the access token with the shorter lifespan
    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    });

    //create the refresh token with the longer lifespan
    let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_LIFE
    });

    //store the refresh token in the user array
    //users[username].refreshToken = refreshToken;
    user.refreshToken = refreshToken;
    user.save();

    //send the access token to the client inside a cookie
    //res.cookie("jwt", accessToken, {secure: true, httpOnly: true});
    res.cookie("jwt", accessToken, {httpOnly: true});
    res.status(200);
    res.send();
    //res.redirect("profile");
};

exports.verify = function(req, res, next) {
    const accessToken = req.cookies.jwt;
    console.log("accessToken", accessToken);

    if(!accessToken) {
        return res.status(403).send();
    }
    let payload; 
    try {
        payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log(payload);
    }
    catch(err) {
        //return res.status(401).send();
    }
    next();
};

exports.refresh = async function(req, res) {
    const accessToken = req.cookies.jwt;
    if(!accessToken) {
        return res.status(403).send();
    }
    let payload;
    try {
        payload = jwt.verify(accessToken, process.env,ACCESS_TOKEN_SECRET);
    }
    catch(err) {
        return res.status(401).send();
    }

    let user = await User.findById(payload.id, "refreshToken");
    const refreshToken = user.refreshToken;
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    }
    catch(err) {
        return res.status(401).send();
    }

    const newToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
    });

    res.cookie("jwt", newToken, {secure: true, httpOnly: true});
    res.send();
}

exports.editProfile = async function(req, res) {
    const token = req.cookies.jwt;
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(payload.id, "username");
    console.log(user);
    user.name = req.body.name;
    user.email = req.body.email;
    user.location = req.body.location;
    user.bio = req.body.bio;
    user.save();
    res.send(user);
}

exports.editPicture = async function (req, res) {
    console.log(req.file);
    const img = fs.readFileSync(path.join(__dirname + "/..", "/uploads", req.file.filename));
    const encode_image = img.toString("base64");

    
    const token = req.cookies.jwt;
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    console.log(user);
    
    user.pic = {
        data: Buffer.from(encode_image, "base64"),
        contentType: req.file.mimetype,
        filename: req.file.filename
    }
    user.save();

    fs.unlink('uploads/' + req.file.filename, (err) => {
        if (err) throw err;
    });

    res.status(200);
    //res.send();
    res.redirect("./profile.html");
}

exports.getPic = async function(req, res) {
    const user = await User.findById("6018887ac0f599939545efa9", "pic");
    console.log(user.pic);
    res.writeHead(200, {
        'Content-Type': user.pic.contentType,
        'Content-disposition': 'attachment;filename=' + user.pic.filename,
        'Content-Length': user.pic.data.length
    });
    res.end(user.pic.data.toString("base64"));
}