const Pandit = require('../models/Pandit')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const jwt = require('jsonwebtoken')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

const register = async(req, res) => {
    const { email, name, password, contact } = req.body
    const emailAlreadyExists = await Pandit.findOne({ email })
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email Already Exists')
    }

    // first registered user is admin
    const isFirstAccount = await Pandit.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'pandit'

    const user = await Pandit.create({ name, email, password, contact, role })

    const tokenUSer = createTokenUser(user)

    attachCookiesToResponse({ res, user: tokenUSer })

    res.status(StatusCodes.CREATED).json({ user: tokenUSer })
}


const login = async(req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password')
    }

    const user = await Pandit.findOne({ email })

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    const tokenUSer = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUSer })
    res.status(StatusCodes.OK).json({ user: tokenUSer })
}


const logout = async(req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({ msg: 'user logged out!! ' })
}

module.exports = {
    register,
    login,
    logout,
}