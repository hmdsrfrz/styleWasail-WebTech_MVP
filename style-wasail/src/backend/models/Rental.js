const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  outfit: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    images: [String],
    dailyPrice: {
      type: Number,
      required: true
    }
  },
  owner: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    profileImage: String
  },
  renter: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
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
      default: 'pending'
    },
    receiptImage: String,
    transactionDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  extensionRequest: {
    requested: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending'
    },
    additionalAmount: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
rentalSchema.index({ 'owner._id': 1, 'renter._id': 1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ createdAt: -1 });

const Rental = mongoose.model('Rental', rentalSchema);

module.exports = Rental; 