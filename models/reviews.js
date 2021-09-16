const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    rating: Number,
    text: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    place: Schema.Types.ObjectId
});





module.exports = mongoose.model('Review', reviewSchema);