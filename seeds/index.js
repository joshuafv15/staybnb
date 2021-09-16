const mongoose = require('mongoose');
const cities = require('./cities');
const Place = require('../models/places');
const Review = require('../models/reviews');
const { sites, descriptors } = require('./seedHelpers');


//using the same seeds file from Yelpcamp just to simplify the process

mongoose.connect('mongodb://localhost:27017/staybnb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log("We're connencted");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Place.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 100; i++) {
        const random100 = Math.floor(Math.random() * 100);
        const place = new Place({
            host: '61112ab52a042b384a9137dc',
            location: `${cities[random100].city}, ${cities[random100].state}`,
            name: `${sample(descriptors)} ${sample(sites)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolore aut repellendus dolorum error tempore officiis, nostrum, totam perferendis nam beatae, illo eaque eveniet tempora. Alias soluta harum adipisci autem fugit",
            price: random100 % 10,
            geometry: {
                "type": "Point",
                "coordinates":
                    [cities[random100].longitude,
                    cities[random100].latitude]
            },
            images: [
                {
                    url: "https://res.cloudinary.com/scenerybubble-yelpcamp/image/upload/v1628767380/StayBnb/Beachfront-Hawaii-0_d5jahs.jpg",
                    filename: "StayBnb/Beachfront-Hawaii-0_d5jahs"
                },
                {
                    url: "https://res.cloudinary.com/scenerybubble-yelpcamp/image/upload/v1628767582/StayBnb/5f6a2598323fc4001e0d7c55_ltqws7.jpg",
                    filename: "StayBnb/5f6a2598323fc4001e0d7c55_ltqws7"
                }]
        })
        await place.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close();
});

