const Pandit = require('../models/Pandit')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse } = require('../utils')
// Admin Controller to Display information of every pandit

const getAllUsers = async (req, res) => {
    const pandits = await Pandit.find({ role: 'pandit' }).select('-password') //removes password

    res.render('../views/pandits.ejs', { pandits });

    // res.status(StatusCodes.OK).json({ users })
}

// IMPORTANT : THIS IS THE ROUTE FOR USER TO SEE THE DETAILS OF PANDIT TO CONNECT
// THIS ROUTE NEEDS TO BE PROTECTED AND THE USER CAN ONLY ACCESS IF LOGGED IN
// SO PLEASE ADD LOGIN MIDDLEWARE

const panditProfile = async (req, res) => {
    const { id } = req.params;

    const pandit = await Pandit.findById(id);

    res.render('../views/panditprofile.ejs', { pandit })
}

const searchPandit = async (req, res) => {

    const { location, pooja } = req.body

    // for now, we will just search with location
    const pandits = await Pandit.find({ location: location });

    res.render('../views/searchPandits.ejs', { pandits })
};


// Gets the User Info

const getSingleUser = async (req, res) => {
    const user = await Pandit.findOne({ _id: req.params.id }).select('-password')

    const pandit = await Pandit.findOne({ _id: panditId }.populate('reviews'))

    // if (!user) {
    //     throw new CustomError.NotFoundError(`No user with ID : ${req.params.id} `)
    // }

    res.render('../views/pandits.ejs')
    // res.status(StatusCodes.OK).json({ user })
}


// To Display current user

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}


// Updates user's information (except password and role values) by fetching name and email

const updateUser = async (req, res) => {
    const { email, name } = req.body
    if (!email || !name) {
        throw new CustomError.BadRequestError('Please, provide all values')
    }

    const user = await User.findOneAndUpdate({ _id: req.user.userId }, { email, name }, { new: true, runValidators: true });
    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUser })
    res.status(StatusCodes.OK).json({ user: tokenUser })
}

// update user with user.save()
// const updateUser = async(req, res) => {
//     const { email, name } = req.body
//     if (!email || !name) {
//         throw new CustomError.BadRequestError('Please, provide all values')
//     }

//     const user = await Pandit.findOne({ _id: req.user.userId });
//     user.email = email;
//     user.name = name;

//     await user.save();

//     const tokenUser = createTokenUser(user)
//     attachCookiesToResponse({ res, user: tokenUser })
//     res.status(StatusCodes.OK).json({ user: tokenUser })
// }


//Update user's password

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide both values')
    }

    const user = await Pandit.findOne({ _id: req.user.userId })

    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated' })
}

const deleteUser = async (req, res) => {
    const { id: panditId } = req.params

    const pandit = await Pandit.findOne({ _id: panditId }).select('-password');

    if (!pandit) {
        throw new CustomError.NotFoundError(`No product with id : ${panditId}`)
    }

    await pandit.remove(); // .remove triggers the hook for the pre.remove so that we can delete the reviews associated with the product when the product get deleted
    res.status(StatusCodes.OK).json({ msg: 'Success! Pandit Removed' })
}

module.exports = {
    getAllUsers,
    panditProfile,
    searchPandit,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
    deleteUser,
}