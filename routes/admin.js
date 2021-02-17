const express = require('express');
const router = express.Router();
const path = require("path");
const admin_controller = require("../controllers/adminController");
const chat_controller = require("../controllers/chatController");
const bookings_controller = require("../controllers/bookingsController");

router.get("/chats-list", admin_controller.verify, unauthRedirect, chat_controller.chatsList);
router.get("/conversation/:id", admin_controller.verify, unauthRedirect, chat_controller.getConversation);
router.post("/send-message", admin_controller.verify, unauthRedirect, chat_controller.sendMessage);

router.get("/bookings-list", admin_controller.verify, unauthRedirect, bookings_controller.bookingsList);
router.post("/approve-booking", admin_controller.verify, unauthRedirect, bookings_controller.approve);
router.post("/reject-booking", admin_controller.verify, unauthRedirect, bookings_controller.reject);

router.get("/:jwt", admin_controller.verify, unauthRedirect, function(req, res, next) { res.sendFile(path.join(__dirname, '..', 'public', 'views', 'admin.html')) });

function unauthRedirect(req, res, next) {
    if (res.statusCode === 401) {
        res.redirect("/log.html");
    }
    else {
        next();
    }
}

module.exports = router;