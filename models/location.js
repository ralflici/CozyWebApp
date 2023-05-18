var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var locationSchema = new Schema({
    name: {type: String, required: true, minlength: 2, maxlength: 100},
    country: {type: String, required: true, minlength: 2, maxlength: 100},
    continent: {type: String, required: true, enum: ["Europe", "Asia", "America", "Africa", "Oceania"]},
    image: {type: String, required: true}
});
module.exports = mongoose.model("location", locationSchema);