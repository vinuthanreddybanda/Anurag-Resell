const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const AppError = require('../utils/appError');

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products (including sold products for admin view)
const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('seller', 'name email')
      .sort('-createdAt');
    res.status(200).json({
      status: 'success',
      results: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reports with details populated
const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email isBanned')
      .populate({
        path: 'reportedProduct',
        populate: {
          path: 'seller',
          select: 'name email',
        },
      })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

// Ban a user
const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new AppError('Administrators cannot be banned', 400));
    }

    user.isBanned = true;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User ${user.name} has been banned successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Unban a user
const unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.isBanned = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User ${user.name} has been unbanned successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a product (admin override)
const deleteProductAdmin = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      status: 'success',
      message: 'Product deleted by administrator successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllProducts,
  getAllReports,
  banUser,
  unbanUser,
  deleteProductAdmin,
};
