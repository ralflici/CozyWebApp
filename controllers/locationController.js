"use strict";

var Location = require("../models/location");

exports.locationsList = function(req, res) {
    Location
    .find({})
    .exec(function (err, listLocations) {
        if (err) {
            res.status(500).send(err)
            return;
        }
        res.send(listLocations);
    });
}

// this function returns all the locations wich contain the string sent by the client
exports.locationsName = function(req, res) {
    const name = req.params.data;
    // create a case insensitive regular expression
    const regexp = new RegExp(name, "i");
    Location
    .find({name: {$regex: regexp}})
    .exec(function (err, listLocations) {
        if (err) {
            res.status(500).send(err)
            return;
        }
        res.send(listLocations);
    })
}

exports.locationsContinent = function(req, res) {
    const continent = req.params.data;
    if (continent === "*") {
        Location
        .find({})
        .exec(function (err, listLocations) {
            if (err) {
                res.status(500).send(err)
                return;
            }
            res.send(listLocations);
        });
    }
    else {
        const regexp = new RegExp(continent, "i");
        Location
        .find({continent: {$regex: regexp}})
        .exec(function (err, listLocations) {
            if (err) {
                res.status(500).send(err)
                return;
            }
            res.send(listLocations);
        });
    }
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
        try {
            await location.save();
        } catch(err) {
            res.status(500).send(err);
            return;
        }
        res.locals.location = location;
        next();
    }
    // otherwise find it in the database and save it for later use
    else {
        try {
            res.locals.location = await Location.findOne({ name: req.body.location });
        } catch(err) {
            res.status(500).send(err);
            return;
        }
        next();
    }
}

exports.removeLocation = function(req, res, next) {
    Location.findByIdAndDelete(res.locals.location._id, function(err, doc) {
        if (err) {
            res.status(500).send(err)
            return;
        }
        console.log(doc);
    });
    next();
}