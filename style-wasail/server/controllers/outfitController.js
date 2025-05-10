import Outfit from '../models/Outfit.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// @desc    Get single outfit
// @route   GET /api/v1/outfits/:id
// @access  Public
export const getOutfit = catchAsync(async (req, res, next) => {
  const outfit = await Outfit.findById(req.params.id).populate({
    path: 'creator',
    select: 'name profilePicture'
  });

  if (!outfit) {
    return next(new AppError('No outfit found with that ID', 404));
  }

  // Increment views
  outfit.engagement.views += 1;
  await outfit.save();

  // Add isCreator flag to response
  const response = outfit.toObject();
  response.isCreator = req.user ? outfit.isCreator(req.user._id) : false;

  res.status(200).json({
    status: 'success',
    data: {
      outfit: response
    }
  });
});

// @desc    Create new outfit
// @route   POST /api/v1/outfits
// @access  Private
export const createOutfit = catchAsync(async (req, res, next) => {
  console.log('=== CREATE OUTFIT START ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('User ID:', req.user._id);

  const { 
    title, 
    description, 
    mainImage, 
    price, 
    type,
    location,
    tags, 
    components 
  } = req.body;

  // Log each field value
  console.log('Field values:', {
    title: title || 'missing',
    description: description || 'missing',
    mainImage: mainImage || 'missing',
    price: price || 'missing',
    type: type || 'missing',
    location: location || 'missing',
    tags: tags || 'missing',
    components: components || 'missing'
  });

  // Validate required fields
  if (!title || !description || !mainImage || !price || !type || !location) {
    console.log('Missing required fields:', {
      title: !!title,
      description: !!description,
      mainImage: !!mainImage,
      price: !!price,
      type: !!type,
      location: !!location
    });
    return next(new AppError('Missing required fields', 400));
  }

  // Validate components
  if (!components || components.length === 0) {
    console.log('No components provided');
    return next(new AppError('At least one component is required', 400));
  }

  // Validate component structure
  for (const component of components) {
    if (!component.type || !component.description || !component.image || !component.price) {
      console.log('Invalid component structure:', component);
      return next(new AppError('Each component must have type, description, image, and price', 400));
    }
  }

  try {
    console.log('Attempting to create outfit in database...');
    
    const outfitData = {
      creator: req.user._id,
      title,
      description,
      mainImage,
      price,
      type,
      location,
      tags,
      components: components.map(comp => ({
        componentId: comp.componentId,
        type: comp.type,
        name: comp.type, // Using type as name since we don't have a separate name field
        description: comp.description,
        image: comp.image,
        price: comp.price,
        location: location, // Using the same location as the main outfit
        tags: comp.tags || []
      }))
    };

    console.log('Outfit data to be created:', JSON.stringify(outfitData, null, 2));

    const outfit = await Outfit.create(outfitData);

    console.log('Outfit created successfully:', outfit._id);
    console.log('=== CREATE OUTFIT END ===');

    res.status(201).json({
      status: 'success',
      data: {
        outfit
      }
    });
  } catch (error) {
    console.error('Error creating outfit:', error);
    console.error('Error stack:', error.stack);
    return next(new AppError('Error creating outfit: ' + error.message, 500));
  }
});

// @desc    Update outfit
// @route   PUT /api/v1/outfits/:id
// @access  Private
export const updateOutfit = catchAsync(async (req, res, next) => {
  const { 
    title, 
    description, 
    mainImage, 
    price, 
    type,
    location,
    tags, 
    components 
  } = req.body;

  const outfit = await Outfit.findById(req.params.id);

  if (!outfit) {
    return next(new AppError('No outfit found with that ID', 404));
  }

  // Check if user is the creator
  if (outfit.creator.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to update this outfit', 403));
  }

  // Update outfit
  outfit.title = title || outfit.title;
  outfit.description = description || outfit.description;
  outfit.mainImage = mainImage || outfit.mainImage;
  outfit.price = price || outfit.price;
  outfit.type = type || outfit.type;
  outfit.location = location || outfit.location;
  outfit.tags = tags || outfit.tags;
  
  // If components are provided, update them while preserving componentIds
  if (components) {
    outfit.components = components.map(comp => {
      const existingComponent = outfit.components.find(c => c.componentId === comp.componentId);
      return {
        ...comp,
        componentId: existingComponent ? existingComponent.componentId : undefined
      };
    });
  }

  await outfit.save();

  res.status(200).json({
    status: 'success',
    data: {
      outfit
    }
  });
});

// @desc    Delete outfit
// @route   DELETE /api/v1/outfits/:id
// @access  Private
export const deleteOutfit = catchAsync(async (req, res, next) => {
  const outfit = await Outfit.findById(req.params.id);

  if (!outfit) {
    return next(new AppError('No outfit found with that ID', 404));
  }

  // Check if user is the creator
  if (outfit.creator.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to delete this outfit', 403));
  }

  await outfit.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// @desc    Like/Unlike outfit
// @route   PUT /api/v1/outfits/:id/like
// @access  Private
export const likeOutfit = catchAsync(async (req, res, next) => {
  const outfit = await Outfit.findById(req.params.id);

  if (!outfit) {
    return next(new AppError('No outfit found with that ID', 404));
  }

  outfit.engagement.likes += 1;
  await outfit.save();

  res.status(200).json({
    status: 'success',
    data: {
      outfit
    }
  });
});

// @desc    Add comment to outfit
// @route   POST /api/v1/outfits/:id/comments
// @access  Private
export const addComment = catchAsync(async (req, res, next) => {
  const { text } = req.body;

  const outfit = await Outfit.findById(req.params.id);

  if (!outfit) {
    return next(new AppError('No outfit found with that ID', 404));
  }

  outfit.engagement.comments.push({
    userId: req.user._id,
    text
  });

  await outfit.save();

  res.status(200).json({
    status: 'success',
    data: {
      outfit
    }
  });
});

// @desc    Get all outfits with filtering
// @route   GET /api/v1/outfits
// @access  Public
export const getAllOutfits = catchAsync(async (req, res, next) => {
  console.log('Getting all outfits...');
  
  const query = {};

  // Filter by tags
  if (req.query.tags) {
    const tags = req.query.tags.split(',');
    query.tags = { $in: tags };
  }

  // Filter by type
  if (req.query.type) {
    query.type = req.query.type;
  }

  // Filter by location
  if (req.query.location) {
    query.location = req.query.location;
  }

  // Filter by component type
  if (req.query.componentType) {
    query['components.type'] = req.query.componentType;
  }

  // Filter by component location
  if (req.query.componentLocation) {
    query['components.location'] = req.query.componentLocation;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  console.log('Query:', query);

  const outfits = await Outfit.find(query)
    .populate({
      path: 'creator',
      select: 'name email profilePicture'
    })
    .sort('-createdAt');

  console.log('Found outfits:', outfits.length);

  // Add isCreator flag to each outfit
  const outfitsWithCreatorFlag = outfits.map(outfit => {
    const outfitObj = outfit.toObject();
    outfitObj.isCreator = outfit.isCreator(req.user?._id);
    return outfitObj;
  });

  res.status(200).json({
    status: 'success',
    results: outfits.length,
    data: {
      outfits: outfitsWithCreatorFlag
    }
  });
});

// @desc    Get user's outfits
// @route   GET /api/v1/outfits/user/me
// @access  Private
export const getUserOutfits = catchAsync(async (req, res, next) => {
  const outfits = await Outfit.find({ creator: req.user._id })
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: outfits.length,
    data: {
      outfits
    }
  });
});

// @desc    Get specific user's outfits
// @route   GET /api/v1/outfits/user/:userId
// @access  Public
export const getSpecificUserOutfits = catchAsync(async (req, res, next) => {
  const outfits = await Outfit.find({ creator: req.params.userId })
    .populate('creator', 'name profilePicture')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: outfits.length,
    data: {
      outfits
    }
  });
});

// @desc    Check if outfit can be rented
// @route   GET /api/v1/outfits/:id/can-rent
// @access  Private
export const checkOutfitRentability = catchAsync(async (req, res, next) => {
  const outfit = await Outfit.findById(req.params.id);

  if (!outfit) {
    return next(new AppError('No outfit found with that ID', 404));
  }

  if (outfit.isCreator(req.user._id)) {
    return next(new AppError('You cannot rent your own outfit', 403));
  }

  if (outfit.status !== 'available') {
    return next(new AppError('This outfit is not available for rent', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      canRent: true
    }
  });
}); 