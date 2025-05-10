import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.ObjectId,
    ref: 'Transaction',
    required: [true, 'Review must belong to a transaction']
  },
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a reviewer']
  },
  reviewee: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a reviewee']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: 1000
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['published', 'flagged', 'removed'],
    default: 'published'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Prevent duplicate reviews
reviewSchema.index({ transaction: 1, reviewer: 1 }, { unique: true });

// Indexes for better query performance
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review; 