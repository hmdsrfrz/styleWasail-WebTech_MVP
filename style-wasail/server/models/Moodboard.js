import mongoose from 'mongoose';

const moodboardSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Moodboard must belong to a creator']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  coverImage: {
    type: String,
    required: false
  },
  outfits: [{
    outfit: {
      type: mongoose.Schema.ObjectId,
      ref: 'Outfit',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: 500
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
moodboardSchema.index({ creator: 1 });
moodboardSchema.index({ isPublic: 1 });
moodboardSchema.index({ tags: 1 });

// Add method to check if user is creator
moodboardSchema.methods.isCreator = function(userId) {
  return this.creator.toString() === userId.toString();
};

const Moodboard = mongoose.model('Moodboard', moodboardSchema);

export default Moodboard; 