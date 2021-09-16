const Place = require('../models/places');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoProfile = mbxGeocoding({ accessToken: mapBoxToken });
const User = require('../models/users');

module.exports.index = async (req, res) => {
    const pageN = req.query.page || 1;
    const limitPerPage = 10;
    const maxPage = Math.floor((await Place.countDocuments()) / limitPerPage + 1);
    if (req.query.page && (req.query.page > maxPage || req.query.page < 0)) {
        req.flash('error', `Where you trying to go??`);
        return res.redirect("/places");
    }
    const startingIndex = (pageN - 1) * limitPerPage;
    const places = await Place.find({}).skip(startingIndex).limit(limitPerPage).populate('host');
    //thought i didnt have to get all data from database but i need this for the cluster map. 
    //i really prefer not to do the pagination client side but this works and even tho it wont scale well, it works for now.  
    const allPlaces = await Place.find({});
    res.render('places/index', { allPlaces, places, maxPage, pageN });
}

module.exports.renderNewForm = (req, res) => {
    res.render('places/new');
}

module.exports.renderEditForm = async (req, res) => {
    const id = req.params.id;
    const place = await Place.findById(id);
    res.render('places/edit', { place, id });
}


module.exports.renderShowPage = async (req, res) => {
    const id = req.params.id;
    const place = await Place.findById(id)
        .populate({ path: 'reviews', populate: { path: 'author' } })
        .populate('host');
    res.render('places/show', { place, id });
}

module.exports.createPlace = async (req, res, next) => {
    const geoData = await geoProfile.forwardGeocode({
        query: req.body.place.location,
        limit: 1
    }).send()
    const place = new Place(req.body.place);
    place.geometry = geoData.body.features[0].geometry;
    place.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    place.host = req.user.id;
    const host = await User.findById(req.user.id);
    await host.places.push(place._id);
    await host.save();
    await place.save();
    req.flash('success', `Successfully added ${place.name}!`);
    res.redirect("/places");
}

module.exports.editPlace = async (req, res, next) => {
    const geoData = await geoProfile.forwardGeocode({
        query: req.body.place.location,
        limit: 1
    }).send()
    const id = req.params.id;
    const place = await Place.findByIdAndUpdate(id, { ...req.body.place });
    place.geometry = geoData.body.features[0].geometry;
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    place.images.push(...imgs);
    await place.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await place.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

    }
    req.flash('success', `Successfully updated ${place.name}!`);
    res.redirect(`/places/${id}`);
}

module.exports.deletePlace = async (req, res) => {
    const id = req.params.id;
    const place = await Place.findByIdAndDelete(id).populate('reviews');
    req.flash('success', `Successfully deleted ${place.name}!`);
    res.redirect('/places');
}