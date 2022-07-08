if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Modules required

const express = require('express');
const app = express();

// our boilerplate engine
const engine = require('ejs-mate');

app.engine('ejs', engine);

const path = require('path');

const mongoose = require('mongoose');


// Database Connection
const dbUrl = process.env.MONGODB_URL || "mongodb://localhost:27017/pujaApp"
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', () => {
    console.error.bind(console, "Connection Error :-(")
});

db.once('open', () => {
    console.log("Connected to Database...")
});



app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// to serve the static files
app.use(express.static(path.join(__dirname, 'public')));




// Home routes
app.get('/', (req, res) => {
    res.render('index.ejs')
});


// PORT
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log('Connected to port...')
})