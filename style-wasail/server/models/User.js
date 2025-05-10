import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from './constants.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  profilePicture: {
    type: String,
    default: 'default-profile.jpg'
  },
  role: {
    type: String,
    enum: USER_ROLES,
    default: 'user'
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String,
    trim: true
  },
  stats: {
    outfitsPosted: {
      type: Number,
      default: 0
    },
    itemsRented: {
      type: Number,
      default: 0
    },
    itemsLent: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  social: {
    followers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for outfits
userSchema.virtual('outfits', {
  ref: 'Outfit',
  foreignField: 'creator',
  localField: '_id'
});

// Virtual populate for moodboards
userSchema.virtual('moodboards', {
  ref: 'Moodboard',
  foreignField: 'creator',
  localField: '_id'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 