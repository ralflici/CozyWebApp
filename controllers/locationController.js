var Location = require("../models/location");

exports.locations_list = function(req, res) {
    Location
        .find({})
        .exec(function (err, listLocations) {
            if (err) {console.log(err);}
            res.send(listLocations);
        });
}