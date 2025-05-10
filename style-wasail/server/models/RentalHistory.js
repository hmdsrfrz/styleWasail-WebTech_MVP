import mongoose from 'mongoose';

const rentalHistorySchema = new mongoose.Schema({
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental',
    required: true
  },
  outfit: {
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    images: [String],
    dailyPrice: Number
  },
  owner: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    profileImage: String
  },
  renter: {
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    profileImage: String
  },
  rentalPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      required: true
    }
  },
  payment: {
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      required: true
    },
    receiptImage: {
      type: String
    },
    transactionDate: {
      type: Date
    }
  },
  extensionRequest: {
    requested: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    totalDays: Number,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    receiptImage: String,
    transactionDate: Date
  },
  status: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'declined',
      'completed',
      'cancelled',
      'extension_requested',
      'extension_receipt_uploaded',
      'extension_accepted',
      'extension_declined'
    ],
    required: true
  },
  actionDate: {
    type: Date,
    default: Date.now
  },
  actionBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const RentalHistory = mongoose.model('RentalHistory', rentalHistorySchema);

export default RentalHistory; 