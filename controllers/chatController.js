const Chat = require("../models/chat");
const User = require("../models/user");
const place_controller = require("./placeController");

exports.chatsList = async function(req, res, next) {
    const chats = await Chat.find({}).populate("user place").exec();
    res.send(chats);
}

exports.getUserChats = function(req,res,next) {
    Chat
    .find({})
    .populate("user place")
    .exec(function(err, chats) {
        if (err) throw err;
        let arr = [];
        for (let i in chats) {
            if (chats[i].user != null && chats[i].user._id == res.locals.userID)
                arr.push(chats[i]);
        }
        res.send(arr);
    });
};

exports.getChat = async function(req, res, next) {
    console.log("url", req.url);
    if (res.statusCode === 401) {
        res.send();
        return;
    }
    Chat
    .find({})
    .populate("user place")
    .exec(async function(err, chats) {
        if (err) throw err;

        let chat;
        for (let i in chats) {
            if (chats[i].user._id == res.locals.userID && chats[i].place._id == req.body.placeID) {
                chat = chats[i];
                break;
            }
        }

        if (chat != undefined)
            res.redirect("/user" + req.url + "/" + chat._id);
        
        else {
            const place = await place_controller.getPlaceByID(req.body.placeID);
            const newChat = new Chat({
                user: res.locals.user,
                place: place,
                content: []
            });
            await newChat.save();
            res.redirect("/user" + req.url + "/" + newChat._id);
        }
    });
}

exports.sendMessage = async function(req, res, next) {
    const chat = await Chat.findById(req.body.chatID);
    const content = {
        sender: req.body.sender,
        message: req.body.message,
        date: Date.now()
    };
    chat.content.push(content);
    await chat.save();
    res.redirect("back");
}

exports.chatExists = async function(req, res, next) {
    console.log(req.params.id);
    try {
        await Chat.findById(req.params.id);
    }
    catch(err) {
        res.sendStatus(404);
        return;
    }
    next();
}

exports.getConversation = async function(req, res, next) {
    const chat = await Chat.findById(req.params.id);
    const place = await place_controller.getPlaceByID(chat.place);
    const user = await User.findById(chat.user, "pic");
    //chat.place.populate("location");
    if (chat == undefined) {
        res.sendStatus(500);
    }
    else {
        res.send({chat: chat, place: place, user: user});
    }
}

exports.deleteUserChats = async function(req, res, next) {
    await Chat.deleteMany({ user: res.locals.userID })
    next();
}