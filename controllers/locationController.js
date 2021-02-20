var Location = require("../models/location");

exports.locationsList = function(req, res) {
    Location
    .find({})
    .exec(function (err, listLocations) {
        if (err) {console.log(err);}
        res.send(listLocations);
    });
}

// this function returns all the locations wich contain the string sent by the client
exports.locationsName = function(req, res) {
    const name = req.body.location;
    // create a case insensitive regular expression
    const regexp = new RegExp(name, "i");
    Location
    .find({name: {$regex: regexp}})
    .exec(function (err, listLocations) {
        if (err) {console.log(err);}
        res.send(listLocations);
    })
}

exports.locationsContinent = function(req, res) {
    const continent = req.body.continent;
    const regexp = new RegExp(continent, "i");
    Location
    .find({continent: {$regex: regexp}})
    .exec(function (err, listLocations) {
        if (err) {console.log(err);}
        res.send(listLocations);
    })
}

exports.insertLocation = async function(req, res, next) {
    // if a new location is required create and save the location
    if (req.body.location === "new-location") {
        const location = new Location({
            name: req.body.newLocationName,
            country: req.body.newLocationCountry,
            continent: req.body.newLocationContinent,
            image: req.body.newLocationImage
        });
        await location.save();
        res.locals.location = location;
        next();
    }
    // otherwise find it in the database and save it for later use
    else {
        res.locals.location = await Location.findOne({ name: req.body.location });
        next();
    }
}

exports.removeLocation = function(req, res, next) {
    Location.findByIdAndDelete({ _id: res.locals.location._id }, function(err, doc) {
        if (err) throw err;
        console.log(doc);
    });
    next();
}