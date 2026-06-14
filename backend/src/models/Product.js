const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['Books', 'Electronics', 'Cycles', 'Furniture', 'Others'],
        message: 'Category must be: Books, Electronics, Cycles, Furniture, or Others',
      },
    },
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: [
        {
          validator: (arr) => arr.length > 0,
          message: 'At least one product image is required',
        },
      ],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
    },
    isSold: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for searching & filtering
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
