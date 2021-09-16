if (process.env.NODE_ENV !== "production") { //This line requires the env file only if we are in production mode.
    require('dotenv').config();
}

const express = require('express')
const app = express()
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const AppError = require('./utils/AppError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/users');
const capitalizeUsername = require('./utils/capitalizeUsername');
const expressMongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { helmetMiddleware } = require('./utils/helmetConfig');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/staybnb';
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'
'thisshouldbeabettersecret!'




const placesRoutes = require('./routes/places');
const reviewsRoutes = require('./routes/reviews');
const usersRoutes = require('./routes/users');

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 3600,
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true, //we only activate secure before deploying because localhost is not secure
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//setting up ejs views file with ejs mate to use boilerplate and partials
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(methodOverride('_method')) //allows us to use PUT and DELETE methods from forms. 
app.use(express.urlencoded({ extended: true })) //to parse the req.body data so it doesnt come undefined
app.use(express.static(path.join(__dirname, 'public')));

//This part is to setup the session and the flash 
app.use(session(sessionConfig));
app.use(flash());
app.use(expressMongoSanitize());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
app.use(helmetMiddleware);


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.capitalizeUsername = capitalizeUsername;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//setting up mongoose to connecto to our new local database. use .save() to save to the db
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we're connected!");
});


app.use('/', usersRoutes)
app.use('/places', placesRoutes);
app.use('/places/:id/review', reviewsRoutes);





app.get('/', (req, res) => {
    res.render('home', { capitalizeUsername });
})

app.all('*', (req, res, next) => {
    next(new AppError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something Went Wrong!";
    res.status(statusCode).render("error", { err });

})

//express opening up our local server and listening to the commands. 
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})