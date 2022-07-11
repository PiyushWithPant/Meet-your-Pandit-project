//const { number } = require('joi')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        minlength: 3,
        maxlength: 51,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide your email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        // validate: {
        //     validator: validator.isStrongPassword,
        //     message: 'Please provide a strong password',
        // },
        minlength: 8,
        //maxlength: 21,
    },
    contact: {
        type: String,
        unique: true,
        required: [true, 'Please provide your contact number'],
        validate: {
            validator: validator.isMobilePhone,
            message: 'Please provide valid phone number',
        },
        minlength: 10,
        maxlength: 10,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'pandit'],
        default: 'user',
    },
})

UserSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

module.exports = mongoose.model('User', UserSchema)