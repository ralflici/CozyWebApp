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
    if (res.statusCode === 401 || res.statusCode === 403) {
        res.send();
        return;
    }
    // Check if there is already another booking with the same data
    const book = await Booking.find({dates: req.body.dates, price: req.body.price}).populate().exec(function(err, bookings) {
        for(let i in bookings)
            if (bookings[i].user_id === res.locals.userID && bookings[i].place._id === req.body.placeID)
                return bookings[i];
    });
    // If there are send error status code
    if (book != null) res.sendStatus(400);

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
    res.sendStatus(200);
    next();
};

exports.getBookingsList = async function(req, res, next) {
    Booking.find({}).populate("user place").exec(function(err, bookings) {
        if (err) throw err;
        const arr = bookings.filter((booking) => {
            console.log("booking: userID:", booking.user._id);
            return booking.user._id == res.locals.userID;
        });
        console.log(arr);
        res.send(arr);
    }); 
};

exports.deleteBooking = async function(req, res, next) {
    try {
        const b = await Booking.find({_id: req.body.bookingID});
        console.log(b);
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