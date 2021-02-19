var Location = require("../models/location");

exports.locations_list = function(req, res) {
    Location
    .find({})
    .exec(function (err, listLocations) {
        if (err) {console.log(err);}
        res.send(listLocations);
    });
}

exports.locations_name = function(req, res) {
    const name = req.body.location;
    const regexp = new RegExp(name, "i");
    Location
    .find({name: {$regex: regexp}})
    .exec(function (err, listLocations) {
        if (err) {console.log(err);}
        res.send(listLocations);
    })
}

exports.locations_continent = function(req, res) {
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