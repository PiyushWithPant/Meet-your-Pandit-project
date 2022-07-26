const Pandit = require('../models/Pandit');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const jwt = require('jsonwebtoken');
const { attachCookiesToResponse, createTokenUser } = require('../utils');
const path = require('path');
// const cloudinary = require('cloudinary').v2
// const fs = require('fs');
const { cloudinary, storage } = require('../Cloudinary/index');
const multer = require('multer');
// using the multer to parse and upload the file to a DESTINATION
const uploadMulter = multer({ storage })

const register = async (req, res) => {
    const { email, name, password, contact, yrsOfExp, location, poojas } = req.body

    const emailAlreadyExists = await Pandit.findOne({ email })
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email Already Exists')
    }

    // first registered user is admin
    const isFirstAccount = await Pandit.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'pandit'

    // user.image = await req.files.map((file) => ({
    //     url: file.path,
    //     filename: file.filename
    // }));

    const user = await Pandit.create({
        name,
        email,
        password,
        contact,
        role,
        yrsOfExp,
        location,
        poojas,
        image: req.files.map((file) => ({
            url: file.path,
            filename: file.filename
        }))
    })

    // await user.save();

    const tokenUSer = createTokenUser(user)

    attachCookiesToResponse({ res, user: tokenUSer })



    // res.status(StatusCodes.CREATED).json({ user: tokenUSer })

    res.redirect('/login');
}


const login = async (req, res) => {
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

    //req.session.loggedin9 = true;
    // res.status(StatusCodes.OK).json({ user: tokenUSer })
    res.redirect('/')
}


const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    //req.session.loggedin = false;
    // res.status(StatusCodes.OK).json({ msg: 'user logged out!! ' })
    res.redirect('/')
}

module.exports = {
    register,
    login,
    logout,
}