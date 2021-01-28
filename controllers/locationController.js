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