const express = require('express');
const router = express.Router();
const path = require('path');
const user_controller = require("../controllers/userController");
const bookings_controller = require("../controllers/bookingsController");
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

router.get("/log.html");
router.get("/profile.html", user_controller.verifyJWT);
router.get("/messages.html", user_controller.verifyJWT);
router.get("/bookings.html", user_controller.verifyJWT);

router.post("/signup", user_controller.signup);
router.post("/login", user_controller.login);
router.post("/edit-profile",user_controller.editProfile);
router.post("/edit-picture", user_controller.verifyJWT, upload.single("picture"), user_controller.editPicture);
router.get("/picture", user_controller.getPic);
router.post("/book-place", user_controller.verifyJWT, bookings_controller.bookPlace);
router.get("/bookings-list", user_controller.verifyJWT, bookings_controller.getBookingsList);
router.use(express.static(path.join(__dirname, '..', 'public', 'views')));

module.exports = router;
