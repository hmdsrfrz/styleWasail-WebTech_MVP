import Transaction from '../models/Transaction.js';
import Outfit from '../models/Outfit.js';
import User from '../models/User.js';

// @desc    Get all transactions
// @route   GET /api/v1/transactions
// @route   GET /api/v1/outfits/:outfitId/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    let query;

    if (req.params.outfitId) {
      query = Transaction.find({ outfit: req.params.outfitId });
    } else {
      // If user is not admin, only show their transactions
      if (req.user.role !== 'admin') {
        query = Transaction.find({
          $or: [
            { renter: req.user.id },
            { owner: req.user.id }
          ]
        });
      } else {
        query = Transaction.find();
      }
    }

    const transactions = await query
      .populate({
        path: 'outfit',
        select: 'title mainImage'
      })
      .populate({
        path: 'renter',
        select: 'name email'
      })
      .populate({
        path: 'owner',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single transaction
// @route   GET /api/v1/transactions/:id
// @access  Private
export const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: 'outfit',
        select: 'title mainImage components filters'
      })
      .populate({
        path: 'renter',
        select: 'name email'
      })
      .populate({
        path: 'owner',
        select: 'name email'
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Make sure user is transaction owner or admin
    if (
      transaction.renter.toString() !== req.user.id &&
      transaction.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new transaction
// @route   POST /api/v1/outfits/:outfitId/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    // Add outfit and renter to req.body
    req.body.outfit = req.params.outfitId;
    req.body.renter = req.user.id;

    const outfit = await Outfit.findById(req.params.outfitId);

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit not found'
      });
    }

    // Add owner to req.body
    req.body.owner = outfit.creator;

    // Check if outfit is available for the requested dates
    const existingTransaction = await Transaction.findOne({
      outfit: req.params.outfitId,
      status: { $in: ['pending', 'active'] },
      'timing.startDate': { $lte: req.body.timing.endDate },
      'timing.endDate': { $gte: req.body.timing.startDate }
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Outfit is not available for the selected dates'
      });
    }

    // Calculate total price
    const days = Math.ceil(
      (new Date(req.body.timing.endDate) - new Date(req.body.timing.startDate)) /
        (1000 * 60 * 60 * 24)
    );
    req.body.payment.amount = outfit.price * days;

    const transaction = await Transaction.create(req.body);

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update transaction
// @route   PUT /api/v1/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Make sure user is transaction owner or admin
    if (
      transaction.renter.toString() !== req.user.id &&
      transaction.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this transaction'
      });
    }

    // Only allow status updates
    if (Object.keys(req.body).length > 1 || !req.body.status) {
      return res.status(400).json({
        success: false,
        message: 'Only status can be updated'
      });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/v1/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Make sure user is transaction owner or admin
    if (
      transaction.renter.toString() !== req.user.id &&
      transaction.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this transaction'
      });
    }

    await transaction.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
}; 