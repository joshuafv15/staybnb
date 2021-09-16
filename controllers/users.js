
const User = require('../models/users');
const Place = require('../models/places');
const { cloudinary } = require('../cloudinary');

module.exports.renderRegisterForm = (req, res) => {
    res.render('user/register');
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/places');
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }

}

module.exports.renderLoginForm = (req, res) => {
    res.render('user/login');
}

module.exports.redirectAfterLogin = (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = req.session.returnTo || '/places';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logOut();
    req.flash('success', 'GoodBye!');
    res.redirect('/places');
}

module.exports.renderProfilePage = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id).populate('places');
    res.render('user/profile', { user });
}

module.exports.renderEditForm = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    res.render('user/editProfile', { user, id });
}

module.exports.editProfile = async (req, res, next) => {
    const id = req.params.id;
    if (req.file) {
        const img = { url: req.file.path, filename: req.file.filename };
        const user = await User.findByIdAndUpdate(id, { ...req.body.user, picture: img });
        if (user.picture) { await cloudinary.uploader.destroy(user.picture.filename); }
    } else {
        const user = await User.findByIdAndUpdate(id, { ...req.body.user });
    }
    if (req.body.deleteImage) {
        await user.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

    }
    req.flash('success', `Successfully updated your profile!`);
    res.redirect(`/user/${id}`);
}



module.exports.deletePic = async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user.picture) {
        await cloudinary.uploader.destroy(user.picture.filename);
        user.picture = null;
        await user.save();
    }
    res.redirect(`/user/${id}`);
}

module.exports.deleteUser = async (req, res) => {
    const id = req.params.id;
    //delete user and populate reviews to then delete them in the user model middleware
    const user = await User.findByIdAndDelete(id).populate('reviews');
    //if you have a picture, it will delete from cloudinary
    if (user.picture) { await cloudinary.uploader.destroy(user.picture.filename); }
    //go to each of the user's places and trigger the place middleware "findOneAndDelete"
    await user.places.forEach(async (placeId) => {
        await Place.findByIdAndDelete(placeId).populate('reviews');
    });
    //go to each review that the author made and delete the id from the corresponding place
    //the review was already deleted from the user model middleware but this way you clean up the data from place.
    user.reviews.forEach(async (review) => await Place.findByIdAndUpdate(review.place, { $pull: { reviews: review._id } }));
    //After deleting the account delete your messages from other users chats. 
    user.chats.forEach(async (chatter) => await User.findByIdAndUpdate(chatter.userId, { $pull: { chats: { userId: user._id } } }));
    req.flash('success', `Successfully deleted your account!`);
    res.redirect('/places');
}

module.exports.renderChat = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate({ path: 'chats', populate: { path: 'userId' } });
    const noChatActive = true;
    res.render('user/chat', { user, id, noChatActive });

}

module.exports.renderChatPage = async (req, res) => {
    const { id, user2Id } = req.params;
    const user = await User.findById(id).populate({ path: 'chats', populate: { path: 'userId' } });
    const user2 = await User.findById(user2Id);
    const noChatActive = false;
    res.render('user/chat', { user, user2, id, noChatActive });


}
module.exports.sendMessage = async (req, res) => {
    const { id, user2Id } = req.params;
    const message = req.body.message;
    const user = await User.findById(id);
    const user2 = await User.findById(user2Id);
    //Probably theres an optimal way of doing the following commands but this will do and it's simpler to understand
    //in terms of efficciency its not great because it wont scale well with nr of users.. 
    if (user.chats.filter(e => String(e.userId) === String(user2Id)).length > 0) {
        user.chats.forEach(async (chatter) => {
            if (String(chatter.userId) === String(user2Id)) {
                await chatter.messages.push({ text: message, sent: true });
            }
        })
        user2.chats.forEach(async (chatter) => {
            if (String(chatter.userId) === String(id)) {
                await chatter.messages.push({ text: message, sent: false });
            }
        })
    } else {
        user.chats.push({ userId: user2Id, messages: { text: req.body.message, sent: true } });
        user2.chats.push({ userId: id, messages: { text: req.body.message, sent: false } });
    }

    await user2.save();
    await user.save();
    res.redirect('back')
}



//Save this code to when you want to add some sort of messages to practice (seeds)
// const user = await User.findByIdAndUpdate(id, {
//     $push: { chats: { userId: user2Id, messages: { text: req.body.message, sent: true } } }
// });
// const user2 = await User.findByIdAndUpdate(user2Id, {
//     $push: { chats: { userId: id, messages: { text: req.body.message, sent: false } } }
// });