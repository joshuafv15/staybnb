const mongoose = require('mongoose');
const Review = require('./reviews');
const User = require('./users');
const Schema = mongoose.Schema;
const { cloudinary } = require('../cloudinary');


//define the image schema and add the virtual thumbnail 
const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } };


//defining the placeSchema with reference to the reviews and users. We define the image schema in another
//instance so that we can add a virtual property to the images (thumbnail)
const placeSchema = new Schema({
    name: String,
    location: String,
    price: Number,
    description: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    images: [imageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
}, opts);


//adds a virtual property to the placeSchema so that you can call it from the model and use the PopUpMarkup
///with the model's information.  
placeSchema.virtual('properties.popUpMarkup').get(function () {
    return `<strong><a href="/places/${this._id}">${this.name}</a><strong>
            <p>${this.description.substring(0, 50)}...</p>`
})

//this middleware triggers after you delete a place. Dont forget to populate the reviews.
placeSchema.post('findOneAndDelete', async function (place) {
    if (place) {
        //Goes to the host and removes the place from his place's collection
        await User.findByIdAndUpdate(place.host, { $pull: { places: place._id } });
        //Goes to each review's author and removes the review from that user
        place.reviews.forEach(async (review) => await User.findByIdAndUpdate(review.author, { $pull: { reviews: review.id } }));
        //deletes all the reviews that were on the place
        await Review.deleteMany({
            _id: {
                $in: place.reviews
            }
        });
        //removes the images from cloudinary so that you dont take extra storage
        place.images.forEach(async (img) => await cloudinary.uploader.destroy(img.filename));
    }
})
//export the model Place according to its schema
module.exports = mongoose.model('Place', placeSchema);