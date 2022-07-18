const express = require('express')
const router = express.Router()
const { authenticateUser, authorizePermissions } = require('../middleware/authentication')
const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
    deleteUser,
} = require('../controllers/panditController')

const { getSinglePanditReviews } = require('../controllers/reviewController');

router.route('/').get(authenticateUser, authorizePermissions('admin'), getAllUsers)
router.route('/showMe').get(authenticateUser, showCurrentUser)
router.route('/updateUser').patch(authenticateUser, updateUser)
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword)
router.route('/:id').get(authenticateUser, getSingleUser).delete(authenticateUser, authorizePermissions('admin'), deleteUser) // ID routes to be placed at bottom

router.route('/:id/reviews').get(getSinglePanditReviews);

module.exports = router