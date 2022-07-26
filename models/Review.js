const mongoose = require('mongoose')

const ReviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide rating'],
    },
    title: {
        type: String,
        trim: true,
        required: [true, 'Please provide review title'],
        maxlength: 100,
    },
    comment: {
        type: String,
        required: [true, 'Please provide review text'],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    pandit: {
        type: mongoose.Schema.ObjectId,
        ref: 'Pandit',
        required: true,
    },
}, { timestamps: true });

// Functionality to control 1 review per user

ReviewSchema.index({ pandit: 1, user: 1 }, { unique: true })

ReviewSchema.statics.calculateAverageRating = async function(panditId) {
    const result = await this.aggregate(
        [
            { $match: { pandit: panditId } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    numOfReviews: { $sum: 1 },
                },
            },
        ]
    );

    // try {
    //     await this.model('Product').findOneAndUpdate({ _id: productId }, {
    //         averageRating: Math.ceil(result[0] ? .averageRating || 0),
    //         numOfReviews: result[0] ? .numOfReviews || 0,
    //     }, )
    // } catch (error) {
    //     console.log(error);
    // }
    // try-catch functionality not working currently due to Optional chaining unsupported error
}

ReviewSchema.post('save', async function() {
    await this.constructor.calculateAverageRating(this.pandit);
})

ReviewSchema.post('remove', async function() {
    await this.constructor.calculateAverageRating(this.pandit);
})

module.exports = mongoose.model('Review', ReviewSchema);