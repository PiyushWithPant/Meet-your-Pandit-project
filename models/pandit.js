//const { number } = require('joi')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const User = require('./User')

// Image schema
const imageSchema = new mongoose.Schema({
    url: String,
    filename: String
})


const PanditSchema = new mongoose.Schema({
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
        enum: ['admin', 'pandit'],
        default: 'pandit',
    },
    yrOfExp: {
        type: Number,
        required: [true, 'Please provide your years of experience'],
    },
    image: [imageSchema],
    // proof: {
    //     type: String,
    //     required: true,
    // },
    featured: {
        type: Boolean,
        default: false,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    // samagiri: {
    //     type: String,
    //     required: [true, 'Please provide the hawan samagri '],
    //     maxlength: [1100, 'Pooja Samagiri cannot be more than 1100 characters'],
    // },
    // user: {
    //     type: mongoose.Types.ObjectId,
    //     ref: 'User',
    //     required: true,
    // },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
},)

PanditSchema.pre('save', async function () {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

PanditSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    return isMatch
}

PanditSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'pandit',
    justOne: false,
    //match: {rating: 5}
});

PanditSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({ pandit: this._id })
});

module.exports = mongoose.model('Pandit', PanditSchema)