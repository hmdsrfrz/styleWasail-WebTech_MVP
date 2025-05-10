import Moodboard from '../models/Moodboard.js';
import Outfit from '../models/Outfit.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// @desc    Get all moodboards
// @route   GET /api/v1/moodboards
// @access  Public
export const getMoodboards = catchAsync(async (req, res, next) => {
  console.log('=== GET MOODBOARDS START ===');
  console.log('User:', req.user?._id);

  if (req.user) {
    // Find system moodboard for this user
    let systemMoodboard = await Moodboard.findOne({
      creator: req.user._id,
      isSystem: true
    });

    // Get all user's outfits
    const userOutfits = await Outfit.find({ creator: req.user._id });
    const coverImage = userOutfits.length > 0
      ? userOutfits[0].mainImage
      : 'https://res.cloudinary.com/dndstaue1/image/upload/v1746825960/style-wasail/defaults/default-moodboard.jpg';
    const userName = req.user.name || 'Your';

    // If system moodboard doesn't exist, create it
    if (!systemMoodboard) {
      systemMoodboard = await Moodboard.create({
        name: `${userName} Moodboard`,
        description: 'All your uploaded outfits',
        coverImage,
        creator: req.user._id,
        isSystem: true,
        isPublic: true,
        outfits: userOutfits.map(outfit => ({
          outfit: outfit._id,
          notes: ''
        }))
      });
      console.log('Created system moodboard:', systemMoodboard._id);
    } else {
      // Update system moodboard with all current outfits
      const currentOutfitIds = systemMoodboard.outfits.map(o => o.outfit.toString());
      const newOutfits = userOutfits
        .filter(outfit => !currentOutfitIds.includes(outfit._id.toString()))
        .map(outfit => ({
          outfit: outfit._id,
          notes: ''
        }));

      if (newOutfits.length > 0) {
        systemMoodboard.outfits.push(...newOutfits);
        await systemMoodboard.save();
        console.log('Updated system moodboard with new outfits:', newOutfits.length);
      }

      // Remove outfits that no longer exist
      const validOutfitIds = userOutfits.map(o => o._id.toString());
      systemMoodboard.outfits = systemMoodboard.outfits.filter(
        o => validOutfitIds.includes(o.outfit.toString())
      );
      await systemMoodboard.save();
    }

    // Get all moodboards (system + custom)
    const moodboards = await Moodboard.find({ creator: req.user._id })
      .populate({
        path: 'creator',
        select: 'name profilePicture'
      })
      .populate({
        path: 'outfits.outfit',
        select: 'title mainImage price'
      });

    console.log('=== GET MOODBOARDS END ===');

    return res.status(200).json({
      status: 'success',
      count: moodboards.length,
      data: {
        moodboards
      }
    });
  }

  // If user is not logged in, return empty array
  res.status(200).json({
    status: 'success',
    count: 0,
    data: {
      moodboards: []
    }
  });
});

// @desc    Get user's moodboards
// @route   GET /api/v1/moodboards/user/me
// @access  Private
export const getUserMoodboards = catchAsync(async (req, res, next) => {
  const moodboards = await Moodboard.find({ creator: req.user._id })
    .populate({
      path: 'outfits.outfit',
      select: 'title mainImage price'
    });

  res.status(200).json({
    status: 'success',
    count: moodboards.length,
    data: {
      moodboards
    }
  });
});

// @desc    Get single moodboard
// @route   GET /api/v1/moodboards/:id
// @access  Public
export const getMoodboard = async (req, res, next) => {
  try {
    const moodboard = await Moodboard.findById(req.params.id)
      .populate({
        path: 'creator',
        select: 'name profilePicture'
      })
      .populate({
        path: 'outfits.outfit',
        select: 'title mainImage price components filters'
      });

    if (!moodboard) {
      return res.status(404).json({
        success: false,
        message: 'Moodboard not found'
      });
    }

    // Check if moodboard is private and user is not the creator
    if (!moodboard.isPublic && moodboard.creator._id.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this moodboard'
      });
    }

    // Increment views
    moodboard.engagement.views += 1;
    await moodboard.save();

    res.status(200).json({
      success: true,
      data: moodboard
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new moodboard
// @route   POST /api/v1/moodboards
// @access  Private
export const createMoodboard = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.creator = req.user.id;

    const moodboard = await Moodboard.create(req.body);

    res.status(201).json({
      success: true,
      data: moodboard
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update moodboard
// @route   PUT /api/v1/moodboards/:id
// @access  Private
export const updateMoodboard = catchAsync(async (req, res, next) => {
  const moodboard = await Moodboard.findById(req.params.id);

  if (!moodboard) {
    return next(new AppError('No moodboard found with that ID', 404));
  }

  // Check if user is the creator
  if (!moodboard.isCreator(req.user._id)) {
    return next(new AppError('You are not authorized to update this moodboard', 403));
  }

  // Prevent updating system moodboards
  if (moodboard.isSystem) {
    return next(new AppError('Cannot update system moodboard', 403));
  }

  // Update moodboard
  moodboard.name = req.body.name || moodboard.name;
  moodboard.description = req.body.description || moodboard.description;
  moodboard.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : moodboard.isPublic;

  await moodboard.save();

  res.status(200).json({
    status: 'success',
    data: {
      moodboard
    }
  });
});

// @desc    Delete moodboard
// @route   DELETE /api/v1/moodboards/:id
// @access  Private
export const deleteMoodboard = catchAsync(async (req, res, next) => {
  const moodboard = await Moodboard.findById(req.params.id);

  if (!moodboard) {
    return next(new AppError('No moodboard found with that ID', 404));
  }

  // Check if user is the creator
  if (!moodboard.isCreator(req.user._id)) {
    return next(new AppError('You are not authorized to delete this moodboard', 403));
  }

  // Prevent deleting system moodboards
  if (moodboard.isSystem) {
    return next(new AppError('Cannot delete system moodboard', 403));
  }

  await moodboard.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Add outfit to moodboard
// @route   POST /api/v1/moodboards/:id/outfits
// @access  Private
export const addOutfit = async (req, res, next) => {
  try {
    const moodboard = await Moodboard.findById(req.params.id);

    if (!moodboard) {
      return res.status(404).json({
        success: false,
        message: 'Moodboard not found'
      });
    }

    // Make sure user is moodboard owner
    if (moodboard.creator.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this moodboard'
      });
    }

    // Check if outfit already exists in moodboard
    const outfitExists = moodboard.outfits.some(
      outfit => outfit.outfit.toString() === req.body.outfitId
    );

    if (outfitExists) {
      return res.status(400).json({
        success: false,
        message: 'Outfit already in moodboard'
      });
    }

    moodboard.outfits.push({
      outfit: req.body.outfitId,
      notes: req.body.notes
    });

    await moodboard.save();

    res.status(200).json({
      success: true,
      data: moodboard
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove outfit from moodboard
// @route   DELETE /api/v1/moodboards/:id/outfits/:outfitId
// @access  Private
export const removeOutfit = async (req, res, next) => {
  try {
    const moodboard = await Moodboard.findById(req.params.id);

    if (!moodboard) {
      return res.status(404).json({
        success: false,
        message: 'Moodboard not found'
      });
    }

    // Make sure user is moodboard owner
    if (moodboard.creator.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to modify this moodboard'
      });
    }

    // Remove outfit from moodboard
    moodboard.outfits = moodboard.outfits.filter(
      outfit => outfit.outfit.toString() !== req.params.outfitId
    );

    await moodboard.save();

    res.status(200).json({
      success: true,
      data: moodboard
    });
  } catch (err) {
    next(err);
  }
}; 