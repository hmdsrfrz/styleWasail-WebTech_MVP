import express from 'express';
import Rental from '../models/Rental.js';
import Outfit from '../models/Outfit.js';
import RentalHistory from '../models/RentalHistory.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Create a new rental request
router.post('/request', protect, async (req, res) => {
  try {
    const { outfitId, startDate, endDate } = req.body;

    // Check if user already has a pending or active rental for this outfit
    const existingRental = await Rental.findOne({
      'outfit._id': outfitId,
      'renter._id': req.user._id,
      status: { $in: ['pending', 'active'] }
    });

    if (existingRental) {
      return res.status(400).json({ 
        message: 'You already have a pending or active rental request for this outfit' 
      });
    }

    // Check if the outfit is already rented by someone else
    const isOutfitRented = await Rental.findOne({
      'outfit._id': outfitId,
      status: 'active'
    });

    if (isOutfitRented) {
      return res.status(400).json({ 
        message: 'This outfit is currently rented by someone else' 
      });
    }

    // Fetch the outfit and owner details
    const outfit = await Outfit.findById(outfitId).populate('creator');
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    // Check if user is trying to rent their own outfit
    if (String(outfit.creator._id) === String(req.user._id)) {
      return res.status(400).json({ 
        message: 'You cannot rent your own outfit' 
      });
    }

    const owner = outfit.creator;
    const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * outfit.price;

    const rental = new Rental({
      outfit: {
        _id: outfit._id,
        title: outfit.title,
        description: outfit.description,
        images: [outfit.mainImage],
        dailyPrice: outfit.price
      },
      owner: {
        _id: owner._id,
        name: owner.name,
        email: owner.email,
        profileImage: owner.profileImage
      },
      renter: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profileImage: req.user.profileImage
      },
      rentalPeriod: {
        startDate,
        endDate,
        totalDays
      },
      payment: {
        totalAmount,
        status: 'pending'
      },
      status: 'pending'
    });
    await rental.save();

    // Create initial rental history record
    const rentalHistory = new RentalHistory({
      rental: rental._id,
      outfit: rental.outfit,
      owner: rental.owner,
      renter: rental.renter,
      rentalPeriod: rental.rentalPeriod,
      payment: rental.payment,
      status: 'pending',
      actionBy: req.user._id
    });
    await rentalHistory.save();

    res.status(201).json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all rentals for the current user
router.get('/my-rentals', protect, async (req, res) => {
  try {
    const rentals = await Rental.find({
      $or: [
        { 'renter._id': req.user._id },
        { 'owner._id': req.user._id }
      ]
    }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept a rental request
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if the current user is the owner
    if (String(rental.owner._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to accept this rental' });
    }

    // Check if the rental is in pending status
    if (rental.status !== 'pending') {
      return res.status(400).json({ message: 'Can only accept pending rentals' });
    }

    // Check if receipt has been uploaded
    if (!rental.payment?.receiptImage) {
      return res.status(400).json({ 
        message: 'Cannot accept rental request. Receipt must be uploaded first.' 
      });
    }

    // Update rental status
    rental.status = 'active';
    await rental.save();

    // Create rental history record
    const rentalHistory = new RentalHistory({
      rental: rental._id,
      outfit: rental.outfit,
      owner: rental.owner,
      renter: rental.renter,
      rentalPeriod: rental.rentalPeriod,
      payment: rental.payment,
      status: 'accepted',
      actionBy: req.user._id
    });
    await rentalHistory.save();

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Decline a rental request
router.put('/:id/decline', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if the current user is the owner
    if (String(rental.owner._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to decline this rental' });
    }

    // Check if the rental is in pending status
    if (rental.status !== 'pending') {
      return res.status(400).json({ message: 'Can only decline pending rentals' });
    }

    // Update rental status
    rental.status = 'declined';
    await rental.save();

    // Create rental history record
    const rentalHistory = new RentalHistory({
      rental: rental._id,
      outfit: rental.outfit,
      owner: rental.owner,
      renter: rental.renter,
      rentalPeriod: rental.rentalPeriod,
      payment: rental.payment,
      status: 'declined',
      actionBy: req.user._id
    });
    await rentalHistory.save();

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a rental request
router.delete('/:id', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if the current user is either the owner or renter
    if (String(rental.owner._id) !== String(req.user._id) && 
        String(rental.renter._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this rental' });
    }

    // Only allow deletion of pending rentals
    if (rental.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending rentals' });
    }

    await rental.deleteOne();
    res.json({ message: 'Rental deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get rental history for the current user
router.get('/history', protect, async (req, res) => {
  try {
    const history = await RentalHistory.find({
      $or: [
        { 'owner._id': req.user._id },
        { 'renter._id': req.user._id }
      ]
    }).sort({ actionDate: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload receipt image
router.post('/:rentalId/receipt', protect, upload.single('receipt'), async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Verify user is the renter
    if (rental.renter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image uploaded' });
    }

    rental.payment.receiptImage = req.file.path;
    rental.payment.transactionDate = new Date();
    await rental.save();

    res.json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Failed to upload receipt'
    });
  }
});

// Request rental extension
router.post('/:id/extension', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const rental = await Rental.findById(req.params.id);
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if the current user is the renter
    if (String(rental.renter._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to request extension' });
    }

    // Check if the rental is active
    if (rental.status !== 'active') {
      return res.status(400).json({ message: 'Can only request extension for active rentals' });
    }

    // Check if there's already a pending extension request
    if (rental.extensionRequest?.requested) {
      return res.status(400).json({ message: 'Extension request already pending' });
    }

    // Calculate extension period and amount
    const extensionDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const extensionAmount = extensionDays * rental.outfit.dailyPrice;

    // Add extension request
    rental.extensionRequest = {
      requested: true,
      startDate,
      endDate,
      totalDays: extensionDays,
      amount: extensionAmount,
      status: 'pending',
      receiptImage: null,
      transactionDate: null
    };

    await rental.save();

    // Create rental history record for extension request
    const rentalHistory = new RentalHistory({
      rental: rental._id,
      outfit: {
        _id: rental.outfit._id,
        title: rental.outfit.title,
        description: rental.outfit.description,
        images: rental.outfit.images,
        dailyPrice: rental.outfit.dailyPrice
      },
      owner: {
        _id: rental.owner._id,
        name: rental.owner.name,
        email: rental.owner.email,
        profileImage: rental.owner.profileImage
      },
      renter: {
        _id: rental.renter._id,
        name: rental.renter.name,
        email: rental.renter.email,
        profileImage: rental.renter.profileImage
      },
      rentalPeriod: {
        startDate: rental.rentalPeriod.startDate,
        endDate: rental.rentalPeriod.endDate,
        totalDays: rental.rentalPeriod.totalDays
      },
      payment: {
        totalAmount: rental.payment.totalAmount,
        status: rental.payment.status,
        receiptImage: rental.payment.receiptImage,
        transactionDate: rental.payment.transactionDate
      },
      extensionRequest: rental.extensionRequest,
      status: 'extension_requested',
      actionBy: req.user._id
    });
    await rentalHistory.save();

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload extension receipt
router.post('/:id/extension-receipt', protect, upload.single('receipt'), async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Verify user is the renter
    if (String(rental.renter._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if there's a pending extension request
    if (!rental.extensionRequest?.requested || rental.extensionRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending extension request found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No receipt image uploaded' });
    }

    rental.extensionRequest.receiptImage = req.file.path;
    rental.extensionRequest.transactionDate = new Date();
    await rental.save();

    // Create rental history record for extension receipt upload
    const rentalHistory = new RentalHistory({
      rental: rental._id,
      outfit: {
        _id: rental.outfit._id,
        title: rental.outfit.title,
        description: rental.outfit.description,
        images: rental.outfit.images,
        dailyPrice: rental.outfit.dailyPrice
      },
      owner: {
        _id: rental.owner._id,
        name: rental.owner.name,
        email: rental.owner.email,
        profileImage: rental.owner.profileImage
      },
      renter: {
        _id: rental.renter._id,
        name: rental.renter.name,
        email: rental.renter.email,
        profileImage: rental.renter.profileImage
      },
      rentalPeriod: {
        startDate: rental.rentalPeriod.startDate,
        endDate: rental.rentalPeriod.endDate,
        totalDays: rental.rentalPeriod.totalDays
      },
      payment: {
        totalAmount: rental.payment.totalAmount,
        status: rental.payment.status,
        receiptImage: rental.payment.receiptImage,
        transactionDate: rental.payment.transactionDate
      },
      extensionRequest: rental.extensionRequest,
      status: 'extension_receipt_uploaded',
      actionBy: req.user._id
    });
    await rentalHistory.save();

    res.json({
      status: 'success',
      data: {
        rental
      }
    });
  } catch (error) {
    console.error('Extension receipt upload error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message || 'Failed to upload extension receipt'
    });
  }
});

// Accept extension request
router.put('/:id/accept-extension', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if the current user is the owner
    if (String(rental.owner._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to accept extension' });
    }

    // Check if there's a pending extension request with receipt
    if (!rental.extensionRequest?.requested || 
        rental.extensionRequest.status !== 'pending' ||
        !rental.extensionRequest.receiptImage) {
      return res.status(400).json({ 
        message: 'No pending extension request with receipt found' 
      });
    }

    // Update rental period and extension status
    rental.rentalPeriod.endDate = rental.extensionRequest.endDate;
    rental.rentalPeriod.totalDays += rental.extensionRequest.totalDays;
    rental.payment.totalAmount += rental.extensionRequest.amount;
    rental.extensionRequest.status = 'accepted';

    await rental.save();

    // Create rental history record for extension acceptance
    const rentalHistory = new RentalHistory({
      rental: rental._id,
      outfit: {
        _id: rental.outfit._id,
        title: rental.outfit.title,
        description: rental.outfit.description,
        images: rental.outfit.images,
        dailyPrice: rental.outfit.dailyPrice
      },
      owner: {
        _id: rental.owner._id,
        name: rental.owner.name,
        email: rental.owner.email,
        profileImage: rental.owner.profileImage
      },
      renter: {
        _id: rental.renter._id,
        name: rental.renter.name,
        email: rental.renter.email,
        profileImage: rental.renter.profileImage
      },
      rentalPeriod: {
        startDate: rental.rentalPeriod.startDate,
        endDate: rental.rentalPeriod.endDate,
        totalDays: rental.rentalPeriod.totalDays
      },
      payment: {
        totalAmount: rental.payment.totalAmount,
        status: rental.payment.status,
        receiptImage: rental.payment.receiptImage,
        transactionDate: rental.payment.transactionDate
      },
      extensionRequest: rental.extensionRequest,
      status: 'extension_accepted',
      actionBy: req.user._id
    });
    await rentalHistory.save();

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Decline extension request
router.put('/:id/decline-extension', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Check if the current user is the owner
    if (String(rental.owner._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to decline extension' });
    }

    // Check if there's a pending extension request
    if (!rental.extensionRequest?.requested || rental.extensionRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending extension request found' });
    }

    // Update extension status
    rental.extensionRequest.status = 'declined';
    await rental.save();

    // Create rental history record for extension decline
    const rentalHistory = new RentalHistory({
      rental: rental._id,
      outfit: {
        _id: rental.outfit._id,
        title: rental.outfit.title,
        description: rental.outfit.description,
        images: rental.outfit.images,
        dailyPrice: rental.outfit.dailyPrice
      },
      owner: {
        _id: rental.owner._id,
        name: rental.owner.name,
        email: rental.owner.email,
        profileImage: rental.owner.profileImage
      },
      renter: {
        _id: rental.renter._id,
        name: rental.renter.name,
        email: rental.renter.email,
        profileImage: rental.renter.profileImage
      },
      rentalPeriod: {
        startDate: rental.rentalPeriod.startDate,
        endDate: rental.rentalPeriod.endDate,
        totalDays: rental.rentalPeriod.totalDays
      },
      payment: {
        totalAmount: rental.payment.totalAmount,
        status: rental.payment.status,
        receiptImage: rental.payment.receiptImage,
        transactionDate: rental.payment.transactionDate
      },
      extensionRequest: rental.extensionRequest,
      status: 'extension_declined',
      actionBy: req.user._id
    });
    await rentalHistory.save();

    res.json(rental);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TODO: Add other endpoints (accept, decline, extension, receipt, etc.)

export default router; 