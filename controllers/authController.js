const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const jwt = require('jsonwebtoken')
const { attachCookiesToResponse, createTokenUser } = require('../utils')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')



const register = async (req, res) => {
    const { email, name, password, contact } = req.body
    const emailAlreadyExists = await User.findOne({ email })
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email Already Exists')
    }

    // first registered user is admin
    const isFirstAccount = (await User.countDocuments({})) === 0
    const role = isFirstAccount ? 'admin' : 'user';

    const verificationToken = crypto.randomBytes(40).toString('hex');

    // const tokenUSer = { name: user.name, userId: user._id, role: user.role }
    // const verificationToken = jwt.sign(tokenUSer, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME, })

    const user = await User.create({ name, email, password, contact, role, verificationToken });

    await sendEmail()

    // send verification token back only while testing in the postman!!

    // res.status(StatusCodes.CREATED).json({ msg: 'Success!! Please check your email to verify the account' })


    //  const tokenUSer = createTokenUser(user)

    // attachCookiesToResponse({ res, user: tokenUSer })

    //res.status(StatusCodes.CREATED).json({ user: tokenUSer })
    res.redirect('/login')
}

const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        throw new CustomError.UnauthenticatedError('Verfication Failed')
    }

    if (user.verificationToken !== verificationToken) {
        throw new CustomError.UnauthenticatedError('Verfication Failed')
    }

    user.isVerified = true,
        user.verified = Date.now()
    user.verificationToken = ''

    await user.save()

    res.status(StatusCodes.OK).json({ msg: 'Email Verified' })
}

const login = async (req, res) => {
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

    // if (!user.isVerified) {
    //     throw new CustomError.UnauthenticatedError('Please Verify Your Email ')
    // }

    const tokenUSer = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUSer })


    //req.session.loggedin = true
    // res.status(StatusCodes.OK).json({ user: tokenUSer })
    res.redirect('/')
}

const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.redirect('/')
}

module.exports = {
    register,
    login,
    logout,
    verifyEmail,
}