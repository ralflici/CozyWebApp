const express = require('express');
const router = express.Router();
const path = require('path');
const user_controller = require("../controllers/userController");
const multer  = require('multer');
const cookieParser = require('cookie-parser');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

router.use(express.static(path.join(__dirname, '..', 'public', 'views')));
router.use(cookieParser());
router.get("/profile", user_controller.verify);
router.get("/messages", user_controller.verify);
router.get("/bookings", user_controller.verify);

router.post("/signup", user_controller.signup);
router.post("/login", user_controller.login);
router.post("/edit-profile", user_controller.verify ,user_controller.editProfile);
router.post("/edit-picture", upload.single("picture"), user_controller.editPicture);
router.get("/picture", user_controller.getPic);

/*
router.get('/profile', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'profile.html'));
});
router.get('/messages', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'messages.html'));
});
router.get('/bookings', function(req, res, next) {
  res.sendFile(path.join(__dirname, '..', 'public', 'views', 'bookings.html'));
});
router.get('/log', function(req, res, next) {
  router.use(serveStatic("public/views", {"log" : "log.html"}));
});*/

module.exports = router;
