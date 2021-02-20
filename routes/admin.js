const express = require('express');
const router = express.Router();
const path = require("path");
const admin_controller = require("../controllers/adminController");
const chat_controller = require("../controllers/chatController");
const bookings_controller = require("../controllers/bookingsController");
const location_controller = require("../controllers/locationController");
const place_controller = require("../controllers/placeController");

router.get("/chats-list", admin_controller.verify, unauthRedirect, chat_controller.chatsList);
router.get("/conversation/:id", admin_controller.verify, unauthRedirect, chat_controller.getConversation);
router.post("/send-message", admin_controller.verify, unauthRedirect, chat_controller.sendMessage);

router.get("/bookings-list", admin_controller.verify, unauthRedirect, bookings_controller.bookingsList);
router.post("/approve-booking", admin_controller.verify, unauthRedirect, bookings_controller.approve);
router.post("/reject-booking", admin_controller.verify, unauthRedirect, bookings_controller.reject, place_controller.removeUnavailableDates, function(req, res, next) { res.redirect("back"); });

router.get("/:jwt/place/:id", admin_controller.verify, unauthRedirect, function(req, res, next) {
    // send a cookie to indicate that the admin wants to edit an existing place with that id
    res.cookie("place", req.params.id);
    res.sendFile(path.join(__dirname, '..', 'public', 'views', 'place.html'));
});
router.get("/:jwt/new-place", admin_controller.verify, unauthRedirect, function(req, res, next) { res.sendFile(path.join(__dirname, '..', 'public', 'views', 'place.html')) });
router.post("/:jwt/edit-place", admin_controller.verify, unauthRedirect, location_controller.insertLocation, place_controller.editPlace);
router.post("/:jwt/insert-place", admin_controller.verify, unauthRedirect, location_controller.insertLocation, place_controller.insertPlace, function(req, res, next) {
    // if place insertion failed then the location should be removed
    if (res.statusCode === 403) {
        location_controller.removeLocation;
        res.send("A place with this name already exists");
        return;
    }
    // otherwise redirect to the main admin page
    else {
        res.redirect("/admin/" + res.locals.userID);
    }
});

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