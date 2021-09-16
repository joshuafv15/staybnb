const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'StayBnb',
        allowedFormats: ['jpeg', 'png', 'jpg'],
        transformation: [
            { aspect_ratio: "16:9", crop: "fill" },
            { width: "700", crop: "scale" }]
    }
})

module.exports = {
    cloudinary,
    storage
}