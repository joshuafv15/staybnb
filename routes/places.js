const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const { validatePlace, isLoggedIn, isAuthor } = require('../middleware/middleware')
const places = require('../controllers/places');
const multer = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage })



router.get('/', wrapAsync(places.index))

router.route('/new')
    .get(isLoggedIn, places.renderNewForm)
    .post(isLoggedIn, upload.array('image'), validatePlace, wrapAsync(places.createPlace))


router.get('/:id/edit', isLoggedIn, isAuthor, wrapAsync(places.renderEditForm))


router.route('/:id')
    .get(wrapAsync(places.renderShowPage))
    .put(isLoggedIn, isAuthor, upload.array('image'), validatePlace, wrapAsync(places.editPlace))
    .delete(isLoggedIn, isAuthor, wrapAsync(places.deletePlace))


module.exports = router;