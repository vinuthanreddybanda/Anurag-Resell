const AppError = require('../utils/appError');

const validateReport = (req, res, next) => {
  const { reportedUser, reportedProduct, reason, description } = req.body;

  if (!reportedUser && !reportedProduct) {
    return next(new AppError('A report must target either a user or a product', 400));
  }

  const validReasons = ['Spam', 'Fake Product', 'Offensive Content', 'Fraud'];
  if (!reason || !validReasons.includes(reason)) {
    return next(new AppError(`Reason must be one of: ${validReasons.join(', ')}`, 400));
  }

  if (!description || typeof description !== 'string' || description.trim().length < 5) {
    return next(new AppError('Please provide a brief description (at least 5 characters)', 400));
  }

  next();
};

module.exports = {
  validateReport,
};
