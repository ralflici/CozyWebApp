var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var bookingSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    place: {type: Schema.Types.ObjectId, ref: 'place', required: true},
    dates: [{type: Date, required: true}, {type: Date, required: true}],
    price: {type: Number, required: true},
    status: {type: String, required: true, enum:["pending", "approved", "rejected"]}
});

bookingSchema.virtual("url").get(function() {
    return "/user/bookings/" + this._id;
});

module.exports = mongoose.model("booking", bookingSchema);