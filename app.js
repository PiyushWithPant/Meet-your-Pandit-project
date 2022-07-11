/* Main Server File (app.js)
Instantiates routers and middlewares, calls database and starts the server
*/

// Invokes environment variable
require('dotenv').config()

require('express-async-errors')

// Express
const express = require('express')
const app = express();

// Rest of the packages

const morgan = require('morgan') // to check the status of each request
const cookieParser = require('cookie-parser') // to parse cookies on the server (used for validation)
const cors = require('cors') // to make server resources available if the front-end is hosted on a different domain/port than the server 

// our boilerplate engine
const engine = require('ejs-mate');

app.engine('ejs', engine);

const path = require('path');


// Database

const connectDB = require('./db/connect')

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

// Middleware

const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

app.use(morgan('tiny'))
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET))
app.use(cors())

// Home routes
app.get('/', (req, res) => {
    res.render('index.ejs')
});

// Other routes

app.get('/contact', (req, res) => {
    res.render('contact.ejs')
});
app.get('/about', (req, res) => {
    res.render('about.ejs')
});

app.get('/poojas', (req, res) => {
    res.render('poojas.ejs')
});

// Login and register routes
app.get('/login', (req, res) => {
    res.render('login.ejs')
});
app.get('/register', (req, res) => {
    res.render('register.ejs')
});


app.use('/api/v1/auth', authRouter) // Register, Login and Logout Routes for the user
app.use('/api/v1/users', userRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin

app.use('/api/v1/pandits', panditAuthRouter) // Register, Login and Logout Routes for the pandit
app.use('/api/v1/pandits', panditRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin

app.use('/api/v1/pandits', panditAuthRouter) // Register, Login and Logout Routes for the pandit
app.use('/api/v1/pandits', panditRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin



app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)


const port = process.env.PORT || 4000

const start = async() => {
    try {
        await connectDB(process.env.MONGO_URL) // database connection
        app.listen(port, console.log(`Server is listening at port ${port}...`))

    } catch (error) {
        console.log(error);
    }
}

start()

