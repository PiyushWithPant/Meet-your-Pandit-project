const Review = require('../models/Review')
const Pandit = require('../models/Pandit')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { checkPermissions } = require('../utils')

const createReview = async(req, res) => {
    const { pandit: panditId } = req.body;

    isValidPandit = await Pandit.findOne({ _id: panditId }).select('-password')

    if (!isValidPandit) {
        throw new CustomError.NotFoundError(`No Pandit with id: ${panditId}`)
    }

    const alreadySubmitted = await Review.findOne({
            pandit: panditId,
            user: req.user.userId,
        }) //checks if the user has already submitted a review

    if (alreadySubmitted) {
        throw new CustomError.BadRequestError('Already Submitted a review for this pandit')
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body)

    res.status(StatusCodes.CREATED).json({ review })

}

const getAllReviews = async(req, res) => {
    const reviews = await Review.find({}
        .populate({ path: 'pandit', select: 'name image yrOfExp price' })
        .populate({ path: 'user', select: 'name' }));

    res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleReview = async(req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId })

    if (!review) {
        throw new CustomError.NotFoundError(`No Review with id ${reviewId}`)
    }

    res.status(StatusCodes.OK).json({ review })
}

const updateReview = async(req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({ _id: reviewId })

    if (!review) {
        throw new CustomError.NotFoundError(`No Review with id ${reviewId}`)
    }

    checkPermissions(req.user, review.user);

    review.rating = rating;
    review.title = title;
    review.comment = comment;

    await review.save();

    res.status(StatusCodes.OK).json({ review })

}

const deleteReview = async(req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId })

    if (!review) {
        throw new CustomError.NotFoundError(`No Review with id ${reviewId}`)
    }

    checkPermissions(req.user, review.user);
    await review.remove()

    res.status(StatusCodes.OK).json({ msg: 'Success! Review Removed' })
}


// Functionality to get reviews for a specific pandit
// The function will be exported to the pandit router for completely implementing the fucntionality
const getSinglePanditReviews = async(req, res) => {
    const { id: panditId } = req.params;
    const reviews = await Review.find({ pandit: panditId })
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSinglePanditReviews,
}