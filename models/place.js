var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var placeSchema = new Schema({
    name: {type: String, required: true, minlength: 2, maxlength: 100},
    type: {type: String, required: true, enum: ["entire place", "private room", "shared room"]},
    avail: [{start: {type: Date, required: true}, end: {type: Date, required: true}}], // Date("YYYY-MM-DD") | Validator: end > start
    guests: {
        adults: {type: Number, default: 1, min: 1, max: 10},
        children: {type: Number, default: 0, min: 0, max: 10},
        infants: {type: Number, default: 0, min: 0, max: 10}
    },
    price: {type: Number, required: true},
    rooms: {
        beds: {type: Number, default: 1, min: 1, max: 10},
        bedrooms: {type: Number, default: 1, min: 1, max: 10},
        bathrooms: {type: Number, default: 1, min: 0, max: 10}
    },
    location: {type: Schema.Types.ObjectId, ref: 'location', required: true},
    images: [String],
    coordinates: [{type: Number, min: -180, max: 180, required: true}, {type: Number, min: -90, max: 90, required: true}]
});

// Non-optimal -> search another way around on openlayers docs
placeSchema.virtual("geojson").get(function() {
    return {
        "type": "Feature",
        "properties": {
            "id": this._id,
            "name": this.name,
            "type": this.type,
            "avail": this.avail, // should probably transform in string
            "guests": this.guests,
            "price": this.price,
            "rooms": this.rooms,
            "images": this.images
        },
        "geometry": {
            "type": "Point",
            "coordinates": this.coordinates
        }
    }
});

module.exports = mongoose.model("place", placeSchema);