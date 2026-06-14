const AppError = require('../utils/appError');

const validateProduct = (req, res, next) => {
  const { title, description, price, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return next(new AppError('Product title is required and must be at least 3 characters', 400));
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return next(new AppError('Product description is required and must be at least 10 characters', 400));
  }

  if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
    return next(new AppError('Price must be a valid positive number', 400));
  }

  const validCategories = ['Books', 'Electronics', 'Cycles', 'Furniture', 'Others'];
  if (!category || !validCategories.includes(category)) {
    return next(new AppError(`Category must be one of: ${validCategories.join(', ')}`, 400));
  }

  next();
};

module.exports = {
  validateProduct,
};
