import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
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
    startDate: Date,
    endDate: Date,
    totalDays: Number
  },
  payment: {
    totalAmount: Number,
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    receiptImage: String,
    transactionDate: Date
  },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  extensionRequest: {
    requested: { type: Boolean, default: false },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
    additionalAmount: Number
  }
}, { timestamps: true });

export default mongoose.model('Rental', rentalSchema); 