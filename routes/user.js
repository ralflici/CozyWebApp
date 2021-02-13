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
router.get("/log.html", user_controller.isLogged);
//router.get("/profile.html", user_controller.verifyJWT2 /*, user_controller.verifyJWT2, unauthRedirect*/);
router.get("/:jwt/profile.html", user_controller.verifyJWT2 /*, user_controller.verifyJWT2,*/, unauthRedirect);
router.get("/:jwt/messages.html", user_controller.verifyJWT2 /*, user_controller.verifyJWT,*/, unauthRedirect);
router.get("/:jwt/bookings.html", user_controller.verifyJWT2 /*, user_controller.verifyJWT,*/, unauthRedirect);

router.post("/signup", user_controller.signup);
router.post("/login", user_controller.login);
router.get("/profile-info", user_controller.verifyJWT, user_controller.getInfo)
router.post("/edit-profile", user_controller.verifyJWT, user_controller.editProfile);
router.post("/edit-picture", user_controller.verifyJWT, upload.single("picture"), user_controller.editPicture);
router.get("/picture", user_controller.verifyJWT, user_controller.getPic);
router.post("/change-password", user_controller.verifyJWT, user_controller.changePassword);
router.post("/delete-account", user_controller.verifyJWT, bookings_controller.deleteUserBookings, place_controller.removeUnavailableDates, chat_controller.deleteUserChats, user_controller.deleteAccount);
router.get("/logout", user_controller.verifyJWT, user_controller.logout);
router.get("/chat-list", user_controller.verifyJWT, chat_controller.getChatList);
router.post("/chat", user_controller.verifyJWT, chat_controller.getChat);
router.get("/chat/:id", user_controller.verifyJWT, unauthRedirect, chat_controller.chatExists, function(req, res, next) {res.sendFile(path.join(__dirname, '..', 'public', 'views', 'chat.html'));});
router.get("/chat/:id/conversation", user_controller.verifyJWT, unauthRedirect, chat_controller.getConversation);
router.post("/send-message", user_controller.verifyJWT, unauthRedirect, chat_controller.sendMessage)
router.post("/book-place", user_controller.verifyJWT, place_controller.isPlaceAvailable, bookings_controller.bookPlace, place_controller.AddUnavailableDates);
router.get("/bookings-list", user_controller.verifyJWT, bookings_controller.getBookingsList);
router.post("/delete-booking", user_controller.verifyJWT, bookings_controller.deleteBooking, place_controller.removeUnavailableDates, function(req, res, next) {res.redirect("back");});
//router.use(express.static(path.join(__dirname, '..', 'public', 'views')));
router.use(express.static(path.join(__dirname, '..', 'public')));

function unauthRedirect(req, res, next) {
  if (res.statusCode == 401 || res.statusCode == 403) {
    res.redirect("/user/log.html");
  }
  else {
    console.log("Page to send", res.locals.dest);
    console.log("Status code", res.statusCode);
    res.sendFile(path.join(__dirname, '..', 'public', 'views', res.locals.dest));
    next();
  }
}

module.exports = router;
