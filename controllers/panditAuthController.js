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
    // To get photo and id proof from the pandit

    // let userImage = req.files.image
    // let userIdProof = req.files.proof


    // const userImage = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
    //     use_filename: true,
    //     folder: 'profile-photos',
    // })
    // const userIdProof = await cloudinary.uploader.upload(req.files.proof.tempFilePath, {
    //     use_filename: true,
    //     folder: 'id-proof',
    // })

    // console.log(req.files.proof)

    // if (!req.files) {
    //     throw new CustomError.BadRequestError('No file uploaded')
    // }

    // if (!userImage.mimetype.startsWith('image') || !userImage.mimetype.endsWith('.png') || !userImage.mimetype.endsWith('.jpg') || !userImage.mimetype.endsWith('.jpeg')) {
    //     throw new CustomError.BadRequestError('Please upload image of described format')
    // }

    // if (!userIdProof.mimetype.startsWith('image') || !userIdProof.mimetype.endsWith('.png') || !userIdProof.mimetype.endsWith('.jpg') || !userIdProof.mimetype.endsWith('.jpeg')) {
    //     throw new CustomError.BadRequestError('Please upload identity proof of described format')
    // }

    // const maxSize = 100 * 1024;

    // if (userImage.size > maxSize) {
    //     throw new CustomError.BadRequestError('Please upload image smaller than 100 KB')
    // }

    // if (userIdProof.size > maxSize) {
    //     throw new CustomError.BadRequestError('Please upload ID proof smaller than 100 KB')
    // }


    const emailAlreadyExists = await Pandit.findOne({ email })
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError('Email Already Exists')
    }

    // first registered user is admin
    const isFirstAccount = await Pandit.countDocuments({}) === 0
    const role = isFirstAccount ? 'admin' : 'pandit'

    const user = await Pandit.create({ name, email, password, contact, role, yrsOfExp, location, poojas })

    user.image = req.files.map((file) => ({
        url: file.path,
        filename: file.filename
    }));

    await user.save();

    const tokenUSer = createTokenUser(user)

    attachCookiesToResponse({ res, user: tokenUSer })

    // fs.unlink(req.files.image.tempFilePath, () => {
    //     if (error) console.log(error);
    // }) // Removing the temp files after uploading them on the cloud
    // fs.unlink(req.files.proof.tempFilePath, () => {
    //     if (error) console.log(error);
    // })

    // fs.unlink(req.files.image.tempFilePath, () => {
    //     if (error) console.log(error);
    // }) // Removing the temp files after uploading them on the cloud
    // fs.unlink(req.files.proof.tempFilePath, () => {
    //     if (error) console.log(error);
    // })


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

    req.session.loggedin = true;
    // res.status(StatusCodes.OK).json({ user: tokenUSer })
    res.redirect('/poojas')
}


const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    req.session.loggedin = false;
    // res.status(StatusCodes.OK).json({ msg: 'user logged out!! ' })
    res.redirect('/')
}

module.exports = {
    register,
    login,
    logout,
}