const Chat = require("../models/chat");
const user_controller = require("./userController");
const place_controller = require("./placeController");

exports.getChatsList = function(req,res,next) {
    if (res.locals.userID == undefined) {
        res.sendStatus(500);
        throw new Error("Error recognizing the user");
    }
    Chat
    .find({})
    .populate()
    .exec(function(err, chats) {
        let arr = [];
        for (let i in chats) {
            if (chats[i].user._id === res.locals.userID);
                arr.push(chats[i]);
        }
        res.locals.chats = arr;
    });
    next();
};

exports.getChatByID = async function(id) {
    try{
        const chat = await Chat.findById(id).exec();
        return chat;
    } 
    catch(err) {
        throw err;
    }
};

function getChat(userID, placeID) {
    Chat
    .find({})
    .populate()
    .exec(function(err, chats) {
        if (err) throw err;
        for (let i in chats)
            if (chats[i].user._id === userID && chats[i].place._id === placeID)
                return chats[i];
    });
    return null;
}

exports.sendMessage = function(req, res, next) {
    if (res.locals.userID == undefined) {
        res.sendStatus(500);
        throw new Error("Error recognizing the user");
    }
    
    let chat = getChat(res.locals.userID, req.body.placeID);
    if (chat === null) {
        chat = new Chat({
            user: user_controller.getUserByID(res.locals.userID),
            place: place_controller.getPlaceByID(req.body.placeID),
            content: [{
                sender: "user",
                message: req.body.message
            }]
        });
        chat.save(function(err) {
            if (err) throw err;
            console.log("New chat: " + chat);
        });
    }
    else {
        let content = {
            sender: "user",
            message: req.body.message
        };
        chat.content.push(content);
    }
    next();
}