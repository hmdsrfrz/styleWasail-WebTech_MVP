const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for receipt image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/receipts/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all rentals for a user (both renting and lending)
router.get('/my-rentals', protect, async (req, res) => {
  try {
    const rentals = await Rental.find({
      $or: [
        { 'renter._id': req.user._id },
        { 'owner._id': req.user._id }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new rental request
router.post('/request', protect, async (req, res) => {
  try {
    const { outfitId, startDate, endDate } = req.body;
    
    // Get outfit and owner details
    const outfit = await Outfit.findById(outfitId).populate('owner');
    if (!outfit) {
      return res.status(404).json({ message: 'Outfit not found' });
    }

    // Calculate total days and amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalAmount = totalDays * outfit.dailyPrice;

    const rental = new Rental({
      outfit: {
        _id: outfit._id,
        title: outfit.title,
        description: outfit.description,
        images: outfit.images,
        dailyPrice: outfit.dailyPrice
      },
      owner: {
        _id: outfit.owner._id,
        name: outfit.owner.name,
        email: outfit.owner.email,
        profileImage: outfit.owner.profileImage
      },
      renter: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        profileImage: req.user.profileImage
      },
      rentalPeriod: {
        startDate: start,
        endDate: end,
        totalDays
      },
      payment: {
        totalAmount,
        status: 'pending'
      },
      status: 'pending'
    });

    await rental.save();
    res.status(201).json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    rental.payment.receiptImage = req.file.path;
    rental.payment.transactionDate = new Date();
    await rental.save();

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept rental request
router.put('/:rentalId/accept', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.rentalId);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Verify user is the owner
    if (rental.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    rental.status = 'active';
    await rental.save();

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request extension
router.post('/:rentalId/extension', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const rental = await Rental.findById(req.params.rentalId);
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Verify user is the renter
    if (rental.renter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const additionalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const additionalAmount = additionalDays * rental.outfit.dailyPrice;

    rental.extensionRequest = {
      requested: true,
      startDate: start,
      endDate: end,
      status: 'pending',
      additionalAmount
    };

    await rental.save();
    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Respond to extension request
router.put('/:rentalId/extension/:action', protect, async (req, res) => {
  try {
    const { action } = req.params; // 'approve' or 'decline'
    const rental = await Rental.findById(req.params.rentalId);
    
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Verify user is the owner
    if (rental.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (action === 'approve') {
      rental.rentalPeriod.endDate = rental.extensionRequest.endDate;
      rental.payment.totalAmount += rental.extensionRequest.additionalAmount;
    }

    rental.extensionRequest.status = action === 'approve' ? 'approved' : 'declined';
    await rental.save();

    res.json(rental);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 