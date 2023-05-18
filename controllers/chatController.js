"use strict";

const Chat = require("../models/chat");
const user_controller = require("./userController");
const place_controller = require("./placeController");

exports.chatsList = async function(req, res, next) {
    try {
        const chats = await Chat.find({}).populate("user place");
        res.send(chats);
    }
    catch(err) {
        res.status(500).send(err);
        return;
    }
}

exports.getUserChats = function(req,res,next) {
    Chat
    .find({})
    .populate("user place")
    .exec(function(err, chats) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        let arr = [];
        for (let i in chats) {
            if (chats[i].user != null && chats[i].user._id == res.locals.userID)
                arr.push(chats[i]);
        }
        res.send(arr);
    });
};

exports.getChat = async function(req, res, next) {
    if (res.statusCode === 401) {
        res.send();
        return;
    }
    Chat
    .find({})
    .populate("user place")
    .exec(async function(err, chats) {
        if (err) {
            res.status(500).send(err);
            return;
        }

        // find the chat that contains the requested user and place
        let chat;
        for (let i in chats) {
            if (chats[i].user._id == res.locals.userID && chats[i].place._id == req.body.placeID) {
                chat = chats[i];
                break;
            }
        }

        // if it was found, redirect to the chat's page 
        if (chat != undefined)
            res.redirect("/user" + req.url + "/" + chat._id);
        // otherwise create a new chat and redirect to its page
        else {
            let place;
            try {
                place = await place_controller.getPlaceByID(req.body.placeID);
            } catch(err) {
                res.status(500).send(err);
                return;
            }
            const newChat = new Chat({
                user: res.locals.user,
                place: place,
                content: []
            });
            try {
                await newChat.save();
            } catch(err) {
                res.status(500).send(err);
                return;
            }
            
            res.redirect("/user" + req.url + "/" + newChat._id);
        }
    });
}

exports.sendMessage = async function(req, res, next) {
    let chat;
    try {
        chat = await Chat.findById(req.body.chatID);
    } catch(err) {
        res.status(500).send(err);
        return;
    }
    // create the content object with the required variables and push it to the chat document
    const content = {
        sender: req.body.sender,
        message: req.body.message,
        date: Date.now()
    };
    chat.content.push(content);
    try {
        await chat.save();
    } catch(err) {
        res.status(500).send(err);
        return;
    }
    res.redirect("back");
}

exports.chatExists = async function(req, res, next) {
    try {
        await Chat.findById(req.params.id);
    } catch(err) {
        res.status(500).send(err);
        return;
    }
    next();
}

exports.getConversation = async function(req, res, next) {
    let chat, place, user;
    try {
        chat = await Chat.findById(req.params.id);
        place = await place_controller.getPlaceByID(chat.place);
        user = await user_controller.getUserByID(chat.user);
    } catch(err) {
        res.status(500).send(err);
    }

    if (chat == undefined) {
        res.sendStatus(500);
    }
    else {
        res.send({chat: chat, place: place, user: user});
    }
}

exports.deleteUserChats = async function(req, res, next) {
    try {
        await Chat.deleteMany({ user: res.locals.userID });
    } catch(err) {
        res.status(500).send(err);
        return;
    }
    next();
}

exports.deletePlaceChats = async function(req, res, next) {
    try {
        await Chat.deleteMany({ place: req.params.id });
    } catch(err) {
        res.status(500).send(err);
        return;
    }
    next();
}