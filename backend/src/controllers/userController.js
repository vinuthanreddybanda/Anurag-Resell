const User = require('../models/User');
const Product = require('../models/Product');
const { uploadImage } = require('../services/cloudinaryService');
const AppError = require('../utils/appError');

// Get current user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.status(200).json({
      status: 'success',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updateData = {};

    if (name) updateData.name = name;



    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Get products listed by the logged-in user
const getUserProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort('-createdAt');
    res.status(200).json({
      status: 'success',
      products,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUserProducts,
};
