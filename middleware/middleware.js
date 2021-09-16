const { placeSchema, reviewSchema, userSchema, messageSchema } = require('../schemas.js');
const AppError = require('../utils/AppError');
const Place = require('../models/places');
const Review = require('../models/reviews');
const User = require('../models/users')


module.exports.validatePlace = (req, res, next) => {
    const { error } = placeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}
module.exports.validateMessage = (req, res, next) => {
    const { error } = messageSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new AppError(msg, 400)
    } else {
        next();
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You need to be signed in!");
        return res.redirect('/login');
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
    const id = req.params.id;
    const place = await Place.findById(id).populate('host');
    if (req.user.id !== place.host.id) {
        req.flash('error', "You do not have permission to do that!");
        return res.redirect(`/places/${id}`)
    }
    next();

}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId).populate("author");
    if (req.user.id !== review.author.id) {
        req.flash('error', "You do not have permission to do that!");
        return res.redirect(`/places/${id}`)
    }
    next();

}

module.exports.isUser = async (req, res, next) => {
    const { id } = req.params;
    if (req.user.id !== id) {
        req.flash('error', "You do not have permission to do that!");
        return res.redirect(`/user/${id}`)
    }
    next();

}
module.exports.isNotSameUser = async (req, res, next) => {
    const { id, user2Id } = req.params;
    if (String(id) === String(user2Id)) {
        req.flash('error', "Dont send Messages to yourself silly!!");
        return res.redirect(`/user/${user2Id}`)
    }
    next();


}