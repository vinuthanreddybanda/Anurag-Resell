const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendVerificationOTP } = require('../services/emailService');
const AppError = require('../utils/appError');

// Register a new user
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Generate verification OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create user
    const newUser = await User.create({
      name,
      email,
      password,
      verificationToken: otp,
      verificationTokenExpires: tokenExpires,
    });

    // Send verification OTP
    await sendVerificationOTP(newUser.email, newUser.name, otp);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please check your email for the 6-digit OTP to verify your account.',
    });
  } catch (error) {
    next(error);
  }
};

// Verify user email with OTP
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError('Please provide email and OTP', 400));
    }

    // Find user by email, OTP token, and expiry
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      verificationToken: otp,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Invalid or expired OTP', 400));
    }

    // Activate account
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Your email has been successfully verified! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists & select password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Check if user is banned
    if (user.isBanned) {
      return next(new AppError('Your account has been banned. Please contact the administrator.', 403));
    }



    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from user object
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout user (client-side deletes JWT, server responds ok)
const logout = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  verifyOTP,
  login,
  logout,
};
