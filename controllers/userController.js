const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { createTokenUser, attachCookiesToResponse } = require('../utils')
    // Admin Controller to Display information of every user

const getAllUsers = async(req, res) => {
    const users = await User.find({ role: 'user' }).select('-password') //removes password
    res.status(StatusCodes.OK).json({ users })
}


// Gets the User Info

const getSingleUser = async(req, res) => {
    const user = await User.findOne({ _id: req.params.id }).select('-password')

    if (!user) {
        throw new CustomError.NotFoundError(`No user with ID : ${req.params.id} `)
    }

    res.status(StatusCodes.OK).json({ user })
}


// To Display current user

const showCurrentUser = async(req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}


// Updates user's information (except password and role values) by fetching name and email

// const updateUser = async(req, res) => {
//     const { email, name } = req.body
//     if (!email || !name) {
//         throw new CustomError.BadRequestError('Please, provide all values')
//     }

//     const user = await User.findOneAndUpdate({ _id: req.user.userId }, { email, name }, { new: true, runValidators: true });
//     const tokenUser = createTokenUser(user)
//     attachCookiesToResponse({ res, user: tokenUser })
//     res.status(StatusCodes.OK).json({ user: tokenUser })
// }

// update user with user.save()
const updateUser = async(req, res) => {
    const { email, name } = req.body
    if (!email || !name) {
        throw new CustomError.BadRequestError('Please, provide all values')
    }

    const user = await User.findOne({ _id: req.user.userId });
    user.email = email;
    user.name = name;

    await user.save();

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUser })
    res.status(StatusCodes.OK).json({ user: tokenUser })
}


//Update user's password

const updateUserPassword = async(req, res) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
        throw new CustomError.BadRequestError('Please provide both values')
    }

    const user = await User.findOne({ _id: req.user.userId })

    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated' })
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
}