import mongoose from 'mongoose';
import { PAYMENT_METHODS, PAYMENT_STATUS, TRANSACTION_STATUS } from './constants.js';

const transactionSchema = new mongoose.Schema({
  outfit: {
    type: mongoose.Schema.ObjectId,
    ref: 'Outfit',
    required: [true, 'Transaction must be associated with an outfit']
  },
  renter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must have a renter']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must have an owner']
  },
  items: [{
    itemId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['complete_outfit', 'individual_item']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  timing: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    actualReturnDate: Date
  },
  payment: {
    method: {
      type: String,
      enum: PAYMENT_METHODS,
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: PAYMENT_STATUS,
      default: 'Pending'
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0
    },
    receiptImage: {
      type: String,
      required: function() {
        return this.payment.method === 'Online Payment';
      }
    },
    transactionId: {
      type: String,
      required: function() {
        return this.payment.method === 'Online Payment';
      }
    }
  },
  status: {
    type: String,
    enum: TRANSACTION_STATUS,
    default: 'Pending'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
transactionSchema.index({ outfit: 1 });
transactionSchema.index({ renter: 1 });
transactionSchema.index({ owner: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'payment.status': 1 });

// Virtual populate for reviews
transactionSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'transaction',
  localField: '_id'
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction; 