const Place = require("../models/place");

exports.places_list = function(req, res) {
    Place
        .find({})
        .exec(function (err, listPlaces) {
            if (err) {console.log(err);}
            res.send(listPlaces);
        });
}