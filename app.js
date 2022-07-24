/* Main Server File (app.js)
Instantiates routers and middlewares, calls database and starts the server
*/

// Invokes environment variable
require('dotenv').config()

require('express-async-errors');

// Express
const express = require('express');
const app = express();


// // File Upload Packages
// const fileUpload = require('express-fileupload')
// // Use v2
// const cloudinary = require('cloudinary').v2
// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET,
// });


//Security Packages

const rateLimiter = require('express-rate-limit'); // limit requests made form each IP address
const helmet = require('helmet'); // to set security related hhtp response Headers
const xss = require('xss-clean'); // to sanitise user input
const cors = require('cors'); // to make server resources available if the front-end is hosted on a different domain/port than the server 
const mongoSanitize = require('express-mongo-sanitize'); // to protext against mongodb injection

// Rest of the packages

const morgan = require('morgan'); // to check the status of each request
const cookieParser = require('cookie-parser'); // to parse cookies on the server (used for validation)

let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;

// our boilerplate engine
const engine = require('ejs-mate');

app.engine('ejs', engine);

const path = require('path');

const poojaList = require('./mockData/poojaList');

// Database

const connectDB = require('./db/connect');

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

// to serve the static files
app.use(express.static(path.join(__dirname, 'public')));


// Routers

const authRouter = require('./routes/authRoutes')
const panditAuthRouter = require('./routes/panditAuthRoutes')

const userRouter = require('./routes/userRoutes')
const panditRouter = require('./routes/panditRoutes')

const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')

// Middleware

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// security middlewares
app.set('trust proxy', 1);
app.use(rateLimiter({
    windowsMs: 60 * 60 * 1000,
    max: 200,
}));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());


app.use(morgan('tiny'));
app.use(express.json());
app.use(express.static('./public'))
// app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser(process.env.JWT_SECRET));

// Content security policy
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.5/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css",
    "https://kit.fontawesome.com/b2fbd3b23e.js"

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.5/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css",
    "https://kit.fontawesome.com/b2fbd3b23e.js"
];

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            "https://res.cloudinary.com/saiyangoku/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
            "https://images.unsplash.com/",
            "https://res.cloudinary.com/saiyangoku/image/upload/v1658683334/Testing/"

        ],
        fontSrc: ["'self'"],
    }
})
);



// Home routes
app.get('/', (req, res) => {

    const States = State.getStatesOfCountry("IN")

    const Cities = City.getCitiesOfCountry("IN")

    res.render('index.ejs', { States: States, Cities: Cities });
});

// Other routes

app.get('/contact', (req, res) => {
    res.render('contact.ejs')
});
app.get('/about', (req, res) => {
    res.render('about.ejs')
});

app.get('/poojas', async (req, res) => {
    const poojas = poojaList
    res.render('poojas.ejs', { poojas: poojas })
});

// Login and register routes
app.get('/login', (req, res) => {
    res.render('login.ejs')
});
app.get('/register', (req, res) => {
    res.render('register.ejs')
});
app.get('/panditregister', (req, res) => {
    const Cities = City.getCitiesOfCountry("IN")
    res.render('panditregister.ejs', { Cities })
});


//Routers
app.use('/api/v1/auth/user', authRouter) // Register, Login and Logout Routes for the user
app.use('/api/v1/auth/pandit', panditAuthRouter) // Register, Login and Logout Routes for the pandit

app.use('/api/v1/pandits', panditRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin
app.use('/api/v1/users', userRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin

// app.use('/api/v1/panditAuth', panditAuthRouter) // Register, Login and Logout Routes for the pandit
// app.use('/api/v1/pandits', panditRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin

app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)


const port = process.env.PORT || 4000

const start = async () => {
    try {

        await connectDB(process.env.MONGO_URL) // for users

        // await connectDB(process.env.MONGO_URI) // for pandits
        app.listen(port, console.log(`Server is listening at port ${port}...`))

    } catch (error) {
        console.log(error);
    }
}

start()

/*
Bugs need to be solved:
1. update user bug
2. image uploadation bug
3. product creation with user id bug
4. try-catch functionality not working currently due to Optional chaining unsupported error


Main issue is of userId and panditId bug. Without its solution a lot of functionality is at hold
*/

/*
Created By: Sambhav Aggarwal & Piyush Pant
*/