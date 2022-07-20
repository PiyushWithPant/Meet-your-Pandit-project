const express = require('express')
const router = express.Router()
const { cloudinary, storage } = require('../Cloudinary/index');
const multer = require('multer');
// using the multer to parse and upload the file to a DESTINATION
const uploadMulter = multer({ storage })


const {
    register,
    login,
    logout,
} = require('../controllers/panditAuthController')

router.post('/register', uploadMulter.array('image'), register)
router.post('/login', login)
router.get('/logout', logout)


// app.post('/api/v1/auth/pandit/searchpandits', async (req, res) => {
//     const { city, poojatype } = req.body

//     const pandit = []
//     res.render('searchPandits.ejs', { pandit })
// });
module.exports = router