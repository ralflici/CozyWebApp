var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var chatSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'user', required: true},
    place: {type: Schema.Types.ObjectId, ref: 'place', required: true},
    content: [{
        sender: {type: String, required: true, enum: ["user", "place"]},
        //read: {type: Boolean, required: true},
        message: {type: String, required: true, maxlength: 500},
        date: {type: Date, required: true}
    }]
});

chatSchema.virtual("url").get(function() {
    return "/chat/" + this._id;
});

module.exports = mongoose.model("chat", chatSchema);