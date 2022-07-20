const mongoose = require('mongoose')
const User = require('./User')

const ProductSchema = new mongoose.Schema({
        name: {
            type: String,
            trim: true,
            required: [true, 'Please provide the product name '],
            maxlength: [100, 'Name cannot be more than 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide the product description '],
            maxlength: [1100, 'Description cannot be more than 1100 characters'],
        },
        image: {
            type: String,
            default: '/uploads/hawan.png',
        },
        samagiri: {
            type: String,
            required: [true, 'Please provide the hawan samagri '],
            maxlength: [1100, 'Pooja Samagiri cannot be more than 1100 characters'],
        },
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
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    }, {
        timestamps: true,
    },

);

module.exports = mongoose.model('Product', ProductSchema);