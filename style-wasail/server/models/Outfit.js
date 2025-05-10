import mongoose from 'mongoose';
import { OUTFIT_STYLES, OCCASIONS, SEASONS, COLORS, SIZES, GENDERS } from './constants.js';

const outfitSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Outfit must belong to a creator']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 1000
  },
  mainImage: {
    type: String,
    required: [true, 'Main image is required']
  },
  price: {
    type: Number,
    required: [true, 'Complete outfit price is required'],
    min: 0
  },
  type: {
    type: String,
    required: [true, 'Outfit type is required'],
    enum: ['Outfit', 'Top', 'Bottom', 'Shoes', 'Accessories']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  components: [{
    componentId: {
      type: String,
      required: true,
      unique: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Outfit', 'Top', 'Bottom', 'Shoes', 'Accessories']
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    location: {
      type: String,
      required: true,
      trim: true
    },
    available: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['available', 'partially_available', 'rented'],
    default: 'available'
  },
  engagement: {
    likes: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    comments: [{
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate unique component ID
outfitSchema.pre('save', async function(next) {
  console.log('=== PRE-SAVE HOOK START ===');
  console.log('Outfit before save:', this.toObject());
  
  if (this.isNew || this.isModified('components')) {
    console.log('Generating component IDs...');
    for (let component of this.components) {
      if (!component.componentId) {
        // Generate a unique ID based on component type and timestamp
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        const outfitPrefix = this._id ? this._id.toString().slice(-4) : 'new';
        component.componentId = `${outfitPrefix}-${component.type.slice(0, 3)}-${timestamp}-${random}`;
        console.log('Generated componentId:', component.componentId);
      }
    }
  }
  
  console.log('=== PRE-SAVE HOOK END ===');
  next();
});

// Indexes for better query performance
outfitSchema.index({ tags: 1 });
outfitSchema.index({ status: 1 });
outfitSchema.index({ creator: 1 });
outfitSchema.index({ location: 1 });
outfitSchema.index({ type: 1 });
outfitSchema.index({ 'components.componentId': 1 });
outfitSchema.index({ 'components.type': 1 });
outfitSchema.index({ 'components.location': 1 });

// Virtual populate for transactions
outfitSchema.virtual('transactions', {
  ref: 'Transaction',
  foreignField: 'outfit',
  localField: '_id'
});

// Add method to check if user is the creator
outfitSchema.methods.isCreator = function(userId) {
  if (!userId) return false;
  return this.creator.toString() === userId.toString();
};

// Add method to check if outfit can be rented by user
outfitSchema.methods.canBeRentedBy = function(userId) {
  return !this.isCreator(userId) && this.status === 'available';
};

// Add virtual for user's outfits
outfitSchema.virtual('userOutfits', {
  ref: 'Outfit',
  localField: 'creator',
  foreignField: 'creator'
});

const Outfit = mongoose.model('Outfit', outfitSchema);

export default Outfit; 