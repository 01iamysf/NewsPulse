const express = require('express');
const User = require('../models/User');
const Withdrawal = require('../models/Withdrawal');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/request', auth, async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user.monetization.isEnabled) {
      return res.status(400).json({ message: 'Monetization is not enabled for your account' });
    }

    const availableEarnings = user.monetization.totalEarnings - user.monetization.withdrawnAmount;

    if (amount < 10) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is $10' });
    }

    if (amount > availableEarnings) {
      return res.status(400).json({ message: 'Insufficient earnings for this withdrawal' });
    }

    const pendingWithdrawal = await Withdrawal.findOne({
      user: req.user.userId,
      status: 'pending'
    });

    if (pendingWithdrawal) {
      return res.status(400).json({ message: 'You already have a pending withdrawal request' });
    }

    const paymentDetails = {
      email: user.paymentInfo?.paypalEmail || '',
      bankName: user.paymentInfo?.bankName || '',
      accountNumber: user.paymentInfo?.accountNumber || '',
      accountHolderName: user.paymentInfo?.accountHolderName || ''
    };

    if (paymentMethod === 'paypal' && !paymentDetails.email) {
      return res.status(400).json({ message: 'Please add your PayPal email in your profile settings' });
    }

    if (paymentMethod === 'bank_transfer') {
      if (!paymentDetails.bankName || !paymentDetails.accountNumber || !paymentDetails.accountHolderName) {
        return res.status(400).json({ message: 'Please complete your bank account details in your profile settings' });
      }
    }

    const withdrawal = new Withdrawal({
      user: req.user.userId,
      amount,
      paymentMethod,
      paymentDetails
    });

    await withdrawal.save();

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        status: withdrawal.status,
        paymentMethod: withdrawal.paymentMethod,
        createdAt: withdrawal.createdAt
      }
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { user: req.user.userId };
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'monetization.totalEarnings monetization.withdrawnAmount'
    );

    const pendingWithdrawals = await Withdrawal.aggregate([
      {
        $match: {
          user: req.user.userId,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const processedWithdrawals = await Withdrawal.aggregate([
      {
        $match: {
          user: req.user.userId,
          status: { $in: ['approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const pendingAmount = pendingWithdrawals[0]?.total || 0;
    const processedAmount = processedWithdrawals[0]?.total || 0;

    res.json({
      totalEarnings: user.monetization.totalEarnings,
      withdrawnAmount: user.monetization.withdrawnAmount,
      pendingAmount,
      processedAmount,
      availableForWithdrawal: user.monetization.totalEarnings - user.monetization.withdrawnAmount - pendingAmount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all withdrawals — admin only
router.get('/', adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = {};
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('user', 'name email paymentInfo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Withdrawal.countDocuments(query);

    res.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update withdrawal status' });
    }

    const { status, transactionId, notes } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    withdrawal.status = status;
    if (transactionId) withdrawal.transactionId = transactionId;
    if (notes) withdrawal.notes = notes;
    if (status === 'approved' || status === 'paid') {
      withdrawal.processedAt = new Date();
    }

    await withdrawal.save();

    if (status === 'paid') {
      await User.findByIdAndUpdate(withdrawal.user, {
        $inc: { 'monetization.withdrawnAmount': withdrawal.amount }
      });
    }

    res.json({
      message: 'Withdrawal status updated',
      withdrawal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
