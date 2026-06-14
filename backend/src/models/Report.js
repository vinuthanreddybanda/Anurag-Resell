const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true, // optional: reported user
    },
    reportedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      index: true, // optional: reported product
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      enum: {
        values: ['Spam', 'Fake Product', 'Offensive Content', 'Fraud'],
        message: 'Reason must be: Spam, Fake Product, Offensive Content, or Fraud',
      },
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
