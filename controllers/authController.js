const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const jwt = require('jsonwebtoken')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

const register = async(req, res) => {
    const { email, name, password, contact } = req.body
    const emailAlreadyExists = await User.findOne({ email })
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email Already Exists')
    }

    // first registered user is admin
    const isFirstAccount = await User.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'user'

    const user = await User.create({ name, email, password, contact, role })

    const tokenUSer = createTokenUser(user)

    attachCookiesToResponse({ res, user: tokenUSer })

    // res.status(StatusCodes.CREATED).json({ user: tokenUSer })
    res.redirect('/login')
}


const login = async(req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials')

    }

    const tokenUSer = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUSer })

    req.session.loggedin = true

    // res.status(StatusCodes.OK).json({ user: tokenUSer })
    res.redirect('/')
}

const logout = async(req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    req.session.loggedin = false;
    res.redirect('/')
}

module.exports = {
    register,
    login,
    logout,
}