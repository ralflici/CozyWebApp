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
            const start = pref.dates.start;
            const end = pref.dates.end;

            let intersection = false;
            for (let i in place.unavail) {
                console.log(i, start, end);
                console.log(i, place.unavail[i].start, place.unavail[i].end);
                if ((start <= place.unavail[i].start && place.unavail[i].start <= end) || (start <= place.unavail[i].end && place.unavail[i].end <= end)) {
                    intersection = true;
                    break;
                }
            }
            return !intersection;
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
};

exports.AddUnavailableDates = async function(req, res, next) {
    const place = await Place.findById(req.body.placeID).populate("location").exec();
    const dates = new Array(new Date(req.body.dates[0]), new Date(req.body.dates[1]));

    for (let i in place.unavail) {
        if ((dates[0] <= place.unavail[i].start && place.unavail[i].start <= dates[1]) || (dates[0] <= place.unavail[i].end && place.unavail[i].end <= dates[1])) {
            res.sendStatus(403);
            return;
        }
    }

    place.unavail.push({start: dates[0], end: dates[1]});
    await place.save();
    res.locals.place = place;
    res.locals.dates = dates;
    next();
};

exports.removeUnavailableDates = async function (req, res, next) {
    for (let i in res.locals.place) {
        const place = await Place.findById(res.locals.place[i]);
        place.unavail.splice(place.unavail.indexOf(res.locals.dates[i]), 1);
        await place.save();
    }
    next();
};