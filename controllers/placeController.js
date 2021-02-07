const Place = require("../models/place");

exports.places_list = function(req, res) {
    Place
    .find({})
    .exec(function (err, listPlaces) {
        if (err) {return next(err);}
        res.send(listPlaces);
    });
}

exports.outmost_price = function(req, res) {
    Place
    .find({}, "location price")
    .populate("location")
    .exec(function (err, listPrices) {
        if (err) {return next(err);}

        let prices = listPrices.map(place => {
            if (req.body.location === "" || place.location.name === req.body.location)
                return place.price
        });
        prices = prices.filter(price => price != undefined)
        res.json({
            min_price: Math.min(...prices), 
            max_price: Math.max(...prices)
        });
    });
}

exports.places_list_filter = function(req, res) {
    const pref = req.body;
    Place
    .find({
        "guests.adults": { $gte: pref.guests.adults },
        "guests.children": { $gte: pref.guests.children },
        "guests.infants": { $gte: pref.guests.infants },
        "price": {$gte: pref.price.min, $lte: pref.price.max},
        "rooms.beds": { $gte: pref.rooms.beds},
        "rooms.bedrooms": { $gte: pref.rooms.bedrooms},
        "rooms.bathrooms": { $gte: pref.rooms.bathrooms},
    })
    .populate("location")
    .exec(function(err, list) {
        if (err) {return next(err);}
        // Filter by location
        let filteredList = list.filter(place => {
            if (place.location.name === pref.location)
                return place
        });
        // Filter by type
        filteredList = filteredList.filter(place => {
            if (pref.type.length === 0 || pref.type.length === 3 || pref.type.indexOf(place.type) !== -1)
                return place;
        });
        // Filter by date
        filteredList = filteredList.filter(place => {
            const start = new Date(pref.dates.start).valueOf();
            const end = new Date(pref.dates.end).valueOf();
            for (let i in place.avail) {
                const availStart = new Date(place.avail[i].start).valueOf();
                const availEnd = new Date(place.avail[i].end).valueOf();
                if (start >= availStart && end <= availEnd) {
                    return place;
                }
            }
        })
        res.send(filteredList);
    });
};

exports.getPlaceByID = async function(id) {
    try{
        const place = await Place.findById(id).populate("location").exec();
        return place;
    } 
    catch(err) {
        throw err;
    } 
}