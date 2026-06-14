const Report = require('../models/Report');
const User = require('../models/User');
const Product = require('../models/Product');
const AppError = require('../utils/appError');

// Create a report
const createReport = async (req, res, next) => {
  try {
    const { reportedUser, reportedProduct, reason, description } = req.body;
    const reporterId = req.user.id;

    // Check if reported user exists
    if (reportedUser) {
      const userExists = await User.findById(reportedUser);
      if (!userExists) {
        return next(new AppError('Reported user does not exist', 404));
      }
    }

    // Check if reported product exists
    if (reportedProduct) {
      const productExists = await Product.findById(reportedProduct);
      if (!productExists) {
        return next(new AppError('Reported product does not exist', 404));
      }
    }

    const report = await Report.create({
      reporter: reporterId,
      reportedUser: reportedUser || undefined,
      reportedProduct: reportedProduct || undefined,
      reason,
      description,
    });

    res.status(201).json({
      status: 'success',
      message: 'Report submitted successfully. Administrators will review it.',
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
};
