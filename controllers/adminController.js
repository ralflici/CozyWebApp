const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.verify = async function(req, res, next) {
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
            const user = await User.findById(payload.id, "password name email location bio pic admin");
            if (!user.admin)
                res.statusCode = 401;
            else {
                res.locals.user = user;
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
}