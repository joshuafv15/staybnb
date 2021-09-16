
const Review = require('../models/reviews');
const Place = require('../models/places');
const User = require('../models/users');

module.exports.createReview = async (req, res, next) => {
    const id = req.params.id;
    const review = new Review(req.body.review);
    review.author = req.user.id;
    review.place = id;
    const place = await Place.findByIdAndUpdate(id, { $push: { reviews: review } });
    const user = await User.findByIdAndUpdate(req.user.id, { $push: { reviews: review } });
    // await place.reviews.push(review);
    // await user.reviews.push(review);
    // await user.save();
    await review.save();
    // await place.save();
    res.redirect(`/places/${id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await User.findByIdAndUpdate(req.user.id, { $pull: { reviews: reviewId } });
    await Place.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/places/${id}`);
}