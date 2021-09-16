const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const Review = require('./reviews');


const pictureSchema = new Schema({
    url: String,
    filename: String
})

const chatterSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    messages: [{
        text: String,
        sent: Boolean
    }]
}, { _id: false });

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    picture: pictureSchema,
    description: {
        type: String,

    },
    places: [{
        type: Schema.Types.ObjectId,
        ref: 'Place'
    }],
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    chats: [chatterSchema]

});

pictureSchema.virtual('thumbnail').get(function () {
    return this.url.replace('upload', '/upload/w_200')
})

userSchema.post('findOneAndDelete', async function (user) {
    if (user) {
        await Review.deleteMany({
            _id: {
                $in: user.reviews
            }
        })
    }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);