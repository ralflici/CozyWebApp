const express = require('express');
const router = express.Router();
const path = require('path');
const user_controller = require("../controllers/userController");
const chat_controller = require("../controllers/chatController");
const bookings_controller = require("../controllers/bookingsController");
const place_controller = require("../controllers/placeController");
const multer  = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get("/", function(req, res, next) {res.statusCode = 404; res.sendFile(path.join(__dirname, '..', 'public', 'views', 'error.html'))});
router.get("/log.html", function(req, res, next) {res.redirect("/log.html")})
router.get("/:jwt/profile.html", user_controller.verifyJWT2, unauthRedirect, function(req, res, next) { res.sendFile(path.join(__dirname, '..', 'public', 'views', res.locals.dest)); });
router.get("/:jwt/messages.html", user_controller.verifyJWT2, unauthRedirect, function(req, res, next) { res.sendFile(path.join(__dirname, '..', 'public', 'views', res.locals.dest)); });
router.get("/:jwt/bookings.html", user_controller.verifyJWT2, unauthRedirect, function(req, res, next) { res.sendFile(path.join(__dirname, '..', 'public', 'views', res.locals.dest)); });
router.get("/profile.html", function(req, res, next) { res.redirect("/user/" + (req.cookies.jwt ? req.cookies.jwt : "0") + "/profile.html"); });
router.get("/messages.html", function(req, res, next) { res.redirect("/user/" + (req.cookies.jwt ? req.cookies.jwt : "0") + "/messages.html"); });
router.get("/bookings.html", function(req, res, next) { res.redirect("/user/" + (req.cookies.jwt ? req.cookies.jwt : "0") + "/bookings.html"); });

router.get("/profile-info", user_controller.verifyJWT2, user_controller.getInfo);

router.post("/edit-profile", user_controller.verifyJWT2, unauthRedirect, user_controller.editProfile);
router.post("/:jwt/edit-picture", user_controller.verifyJWT2, unauthRedirect, upload.single("picture"), user_controller.editPicture);
router.get("/picture", user_controller.verifyJWT2, user_controller.getPic);
router.post("/change-password", user_controller.verifyJWT2, unauthRedirect, user_controller.changePassword);
router.post("/delete-account", user_controller.verifyJWT2, unauthRedirect, bookings_controller.deleteUserBookings, place_controller.removeUnavailableDates, chat_controller.deleteUserChats, user_controller.deleteAccount);

router.post("/:jwt/chat", user_controller.verifyJWT2, unauthRedirect, chat_controller.getChat);
router.get("/user-chats-list", user_controller.verifyJWT2, chat_controller.getUserChats);
router.get("/:jwt/chat/:id", user_controller.verifyJWT2, unauthRedirect, chat_controller.chatExists, function(req, res, next) {res.sendFile(path.join(__dirname, '..', 'public', 'views', 'chat.html'));});
router.get("/:jwt/chat/:id/conversation", user_controller.verifyJWT2, chat_controller.getConversation);
router.post("/send-message", user_controller.verifyJWT2, unauthRedirect, chat_controller.sendMessage);

router.post("/book-place", user_controller.verifyJWT2, unauthRedirect, place_controller.isPlaceAvailable, bookings_controller.bookPlace, place_controller.AddUnavailableDates);
router.get("/user-bookings-list", user_controller.verifyJWT2, bookings_controller.getUserBookings);
router.post("/delete-booking", user_controller.verifyJWT2, unauthRedirect, bookings_controller.deleteBooking, place_controller.removeUnavailableDates, function(req, res, next) {res.redirect("back");});
router.use(express.static(path.join(__dirname, '..', 'public', 'views')));
router.use(express.static(path.join(__dirname, '..', 'public')));

function unauthRedirect(req, res, next) {
  if (res.statusCode == 401 || res.statusCode == 403) {
    if (res.locals.user && res.locals.user.admin)
      res.redirect("/admin/" + res.locals.jwt);
    else
      res.redirect("/log.html");
  }
  else {
    //console.log("Page to send", res.locals.dest);
    //res.sendFile(path.join(__dirname, '..', 'public', 'views', res.locals.dest));
    next();
  }
}

module.exports = router;
