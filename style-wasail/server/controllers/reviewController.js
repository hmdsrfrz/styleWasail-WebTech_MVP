import Review from '../models/Review.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/transactions/:transactionId/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    let query;

    if (req.params.transactionId) {
      query = Review.find({ transaction: req.params.transactionId });
    } else {
      query = Review.find();
    }

    const reviews = await query
      .populate({
        path: 'transaction',
        select: 'outfit'
      })
      .populate({
        path: 'reviewer',
        select: 'name profilePicture'
      })
      .populate({
        path: 'reviewee',
        select: 'name profilePicture'
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'transaction',
        select: 'outfit'
      })
      .populate({
        path: 'reviewer',
        select: 'name profilePicture'
      })
      .populate({
        path: 'reviewee',
        select: 'name profilePicture'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new review
// @route   POST /api/v1/transactions/:transactionId/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    // Add transaction and reviewer to req.body
    req.body.transaction = req.params.transactionId;
    req.body.reviewer = req.user.id;

    const transaction = await Transaction.findById(req.params.transactionId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if transaction is completed
    if (transaction.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed transactions'
      });
    }

    // Check if user is part of the transaction
    if (
      transaction.renter.toString() !== req.user.id &&
      transaction.owner.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to review this transaction'
      });
    }

    // Set reviewee based on reviewer
    req.body.reviewee =
      transaction.renter.toString() === req.user.id
        ? transaction.owner
        : transaction.renter;

    // Check if review already exists
    const existingReview = await Review.findOne({
      transaction: req.params.transactionId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this transaction'
      });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 