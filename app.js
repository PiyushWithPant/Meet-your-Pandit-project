/* Main Server File (app.js)
Instantiates routers and middlewares, calls database and starts the server
*/

// Invokes environment variable
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

require('express-async-errors');

// Express
const express = require('express');
const app = express();

// Rest of the packages

const morgan = require('morgan'); // to check the status of each request
const cookieParser = require('cookie-parser'); // to parse cookies on the server (used for validation)
const cors = require('cors'); // to make server resources available if the front-end is hosted on a different domain/port than the server 

// our boilerplate engine
const engine = require('ejs-mate');

app.engine('ejs', engine);

const path = require('path');

// Database

const connectDB = require('./db/connect');



app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// to serve the static files
app.use(express.static(path.join(__dirname, 'public')));

// Routers

const authRouter = require('./routes/authRoutes');
const panditAuthRouter = require('./routes/panditAuthRoutes');
const userRouter = require('./routes/userRoutes');
const panditRouter = require('./routes/panditRoutes');

// Middleware

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(cors());

// poojas - temporary

poojasList = [
    'Ganapathi Homam',
    'Seemantham (Baby Shower)',
    'Wedding (Vivaham)',
    'Punyaha Vachanam and Nama Karanam',
    'Anna Prasanam',
    'Chowla Upanayanam / Thread Ceremony',
    'Ugra Radha Shanti / 59th Birthday',
    'Shashti Purti (Shastabya Purti / Shashtiabdha Poorthi / 60th Birthday)',
    'Vijaya Radha Shanti / 75th Birthday',
    'Sata Abhishekam / Sathabhishekam / 80th Birthday',
    'Purna Kanaka Abhishekham',
    'Rudra Abhishekam',
    'Navagraha Homam',
    'Ayushya Homam / Mrityunjaya Homam',
    'Chandi Homam',
    'Sudharshana Homam',
    'Sri Maha Lakshmi Homam Sri Suktha Homam',
    'Durga Homam / Lakshmi Homam / Saraswati Homam',
    'Bhagavaty Seva',
    'Vaasthu Homam / Gruha Pravesh',
    'Nakshatra Homam',
    'Satya Narayana Vratham / Satya Narayana Puja',
    'Ayyappa Puja',
    'Bhima ratha Shanthi (70th Birthday)',
    'Bhoomi Pooja',
    'Kanakabhishekam',
    'Laskshmi Kubera Pooja',
]


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

app.get('/poojas', async (req, res) => {
    const poojas = poojasList
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
    res.render('panditregister.ejs')
});


app.use('/api/v1/auth', authRouter) // Register, Login and Logout Routes for the user
app.use('/api/v1/users', userRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin

app.use('/api/v1/pandits', panditAuthRouter) // Register, Login and Logout Routes for the pandit
app.use('/api/v1/pandits', panditRouter) // User functionalities like show current user on reload, profile updation and to display all users to admin



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

