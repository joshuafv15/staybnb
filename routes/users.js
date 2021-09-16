const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const users = require('../controllers/users');
const { isLoggedIn, isUser, isNotSameUser, validateUser, validateMessage } = require('../middleware/middleware');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })

router.route('/register')
    .get(users.renderRegisterForm)
    .post(wrapAsync(users.registerUser));

router.route('/user/:id')
    .get(isLoggedIn, wrapAsync(users.renderProfilePage))
    .put(isLoggedIn, isUser, upload.single('image'), validateUser, wrapAsync(users.editProfile))
    .delete(isLoggedIn, isUser, wrapAsync(users.deleteUser));

router.route('/user/:id/chat')
    .get(isLoggedIn, isUser, wrapAsync(users.renderChat));

router.route('/user/:id/chat/:user2Id')
    .get(isLoggedIn, isUser, isNotSameUser, wrapAsync(users.renderChatPage))
    .post(isLoggedIn, isUser, validateMessage, wrapAsync(users.sendMessage));

router.get('/user/:id/edit', isLoggedIn, isUser, wrapAsync(users.renderEditForm));

router.delete('/user/:id/deletepic', isLoggedIn, isUser, wrapAsync(users.deletePic))

router.route('/login')
    .get(users.renderLoginForm)
    .post(
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        users.redirectAfterLogin);

router.route('/logout')
    .get(users.logoutUser);

module.exports = router;


