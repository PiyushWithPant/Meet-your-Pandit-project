if (process.env.NODE_ENV !== 'production') {
    require('doteven').config();
}

// Modules required




// Home routes
app.get('/', (req, res) => {
    res.render('index.ejs')
});


// PORT
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log('Connected to port...')
})