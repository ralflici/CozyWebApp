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
    // Check if there is already another booking with the same data
    const book = await Booking.find({dates: req.body.dates, price: req.body.price}).populate().exec(function(err, bookings) {
        for(let i in bookings)
            if (bookings[i].user_id === res.locals.userID && bookings[i].place._id === req.body.placeID)
                return bookings[i];
    });
    // If there are send error status code
    if (book != null) res.send(400);

    // Otherwise create a new booking and save it in the database
    const user = await user_controller.getUserByID(res.locals.userID);
    const place = await place_controller.getPlaceByID(req.body.placeID);
    const days = 1//(req.body.dates[1] - req.body.dates[0])/86400000;
    console.log("days:", days);

    dates = new Array(new Date(req.body.dates[0]), new Date(req.body.dates[1]));
    console.log(dates);

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
        console.log("New booking: " + booking);
    });
    res.sendStatus(200);
    next();
};

exports.getBookingsList = async function(req, res, next) {
    Booking.find({}).populate("user place").exec(function(err, bookings) {
        if (err) throw err;
        const arr = bookings.filter((booking) => {
            return booking.user._id == res.locals.userID;
        });
        console.log(arr);
        res.send(arr);
    }); 
};