const Booking = require("../models/booking");
const user_controller = require("./userController");
const place_controller = require("./placeController");

exports.getBookingByID = async function(id) {
    try{
        const place = await Something.findById(id).exec();
        return place;
    } 
    catch(err) {
        throw err;
    }
}

exports.bookPlace = async function(req, res, next) {
    if (res.statusCode === 401) {
        res.send();
        return;
    }
    // Check if there is already another booking with the same data
    const book = await Booking.findOne({dates: req.body.dates, user: res.locals.userID, place: req.body.placeID});
    console.log(book);
    // If there are send error status code
    if (book != null) {
        res.statusCode = 403;
        res.send();
        return;
    }

    // Otherwise create a new booking and save it in the database
    const user = res.locals.user;
    const place = await place_controller.getPlaceByID(req.body.placeID);
    const days = 1//(req.body.dates[1] - req.body.dates[0])/86400000;

    dates = new Array(new Date(req.body.dates[0]), new Date(req.body.dates[1]));

    const booking = new Booking({
        user: user,
        place: place,
        dates: dates,
        price: req.body.price*days
    });
    booking.save(function(err) {
        if (err) {
            throw err;
        }
    });
    res.send();
    next();
};

exports.getBookingsList = async function(req, res, next) {
    Booking.find({}).populate("user place").exec(function(err, bookings) {
        if (err) throw err;
        const arr = bookings.filter((booking) => {
            return booking.user._id == res.locals.userID;
        });
        res.send(arr);
    }); 
};

exports.deleteBooking = async function(req, res, next) {
    try {
        const b = await Booking.find({_id: req.body.bookingID});
        await Booking.deleteOne({_id: req.body.bookingID});
        res.status(200);
        res.redirect('back');
        res.send();
    }
    catch(err) {
        res.sendStatus(500);
        throw err;
    }
}

exports.deleteUserBookings = async function(req, res, next) {
    await Booking.deleteMany({ user: res.locals.userID })
    next();
}