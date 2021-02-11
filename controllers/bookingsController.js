const Booking = require("../models/booking");
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
    // If it exists send error status code
    if (book != null) {
        res.statusCode = 403;
        res.send();
        return;
    }

    // Otherwise create a new booking and save it in the database
    const user = res.locals.user;
    const place = await place_controller.getPlaceByID(req.body.placeID);
    res.locals.place = place;

    const dates = new Array(new Date(req.body.dates[0]), new Date(req.body.dates[1]));
    res.locals.dates = dates;

    const booking = new Booking({
        user: user,
        place: place,
        dates: dates,
        price: req.body.price*req.body.nights
    });
    booking.save(function(err) {
        if (err) {
            throw err;
        }
    });
    //res.send();
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
        const b = await Booking.findById(req.body.bookingID);
        res.locals.place = [];
        res.locals.place.push(b.place);
        res.locals.dates = [];
        res.locals.dates.push({start: b.dates[0], end: b.dates[1]});
        await Booking.deleteOne({_id: req.body.bookingID});
    }
    catch(err) {
        throw err;
    }
    next();
}

exports.deleteUserBookings = async function(req, res, next) {
    const b = await Booking.find({ user: res.locals.userID });
    res.locals.place = [];
    res.locals.dates = [];
    for (let i in b) {
        res.locals.place.push(b[i].place);
        res.locals.dates.push({start: b[i].dates[0], end: b[i].dates[1]});
    }
    await Booking.deleteMany({ user: res.locals.userID });
    next();
}