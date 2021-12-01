var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var objectId = mongoose.Types.ObjectId;
var userSchema = new Schema({
    _id: { type: objectId, auto: true },
    backgroundColor: { type: String, required: true },
    title: { type: String, required: true },
    textColor: { type: String, required: true },
    artist: { type: Array, required: true },
    album: { type: String, required: true },
    picture: { type: String, required: true }
}, {
    versionKey: false
});
const track = mongoose.model('tracks', userSchema);
module.exports = track;