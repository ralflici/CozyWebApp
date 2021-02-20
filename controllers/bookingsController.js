const Booking = require("../models/booking");

exports.bookingsList = async function(req, res, next) {
    const list = await Booking.find({}).populate("user place");
    res.send(list);
}

exports.approve = async function(req, res, next) {
    const booking = await Booking.findById(req.body.bookingID);
    booking.status = "approved";
    await booking.save();
    res.redirect("back");
}

exports.reject = async function(req, res, next) {
    const booking = await Booking.findById(req.body.bookingID);
    booking.status = "rejected";
    await booking.save();
    // save the following variables in order to remove the unavailable dates from the place since the booking was rejected
    res.locals.place = [];
    res.locals.place.push(booking.place);
    res.locals.dates = [];
    res.locals.dates.push({ start: booking.dates[0], end: booking.dates[1] });
    // skip is required in the following function (place_controller.removeUnavailableDates)
    res.locals.skip = [];
    res.locals.skip.push(false);
    next();
}

exports.getBookingByID = async function(id) {
    try{
        const place = await Something.findById(id);
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
    // check if there is already another booking with the same data
    const book = await Booking.findOne({dates: req.body.dates, user: res.locals.userID, place: req.body.placeID});
    // If it exists send error status code
    if (book != null && book.status !== "rejected") {
        res.statusCode = 403;
        res.send();
        return;
    }

    // Otherwise create a new booking and save it in the database as pending
    const booking = new Booking({
        user: res.locals.user,
        place: res.locals.place,
        dates: res.locals.dates,
        price: req.body.price*req.body.nights,
        status: "pending"
    });
    await booking.save();
    next();
};

exports.getUserBookings = async function(req, res, next) {
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
        // save the following variables in order to remove the unavailable dates from the place since the booking is going to be deleted
        res.locals.place = [];
        res.locals.place.push(b.place);
        res.locals.dates = [];
        res.locals.dates.push({start: b.dates[0], end: b.dates[1]});
        res.locals.skip = [];
        if(b.status === "rejected") // If the booking was already rejected we don't need to remove the unavailable dates
            res.locals.skip.push(true);
        else
            res.locals.skip.push(false);
        await Booking.deleteOne({_id: req.body.bookingID});
    }
    catch(err) {
        throw err;
    }
    next();
}

exports.deleteUserBookings = async function(req, res, next) {
    const b = await Booking.find({ user: res.locals.userID });
    // save the following variables in order to remove the unavailable dates from the places since the bookings are going to be deleted
    res.locals.place = [];
    res.locals.dates = [];
    res.locals.skip = [];
    for (let i in b) {
        res.locals.place.push(b[i].place);
        res.locals.dates.push({start: b[i].dates[0], end: b[i].dates[1]});
        if(b[i].status === "rejected") // If the booking was already rejected we don't need to remove the unavailable dates
            res.locals.skip.push(true);
        else
            res.locals.skip.push(false);
    }
    await Booking.deleteMany({ user: res.locals.userID });
    next();
}