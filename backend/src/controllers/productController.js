const Product = require('../models/Product');
const { uploadImage } = require('../services/cloudinaryService');
const AppError = require('../utils/appError');

// Create a new product listing
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category } = req.body;

    if (!req.files || req.files.length === 0) {
      return next(new AppError('At least one product image is required', 400));
    }

    // Upload all images and collect URLs
    const imageUrls = [];
    for (const file of req.files) {
      try {
        const url = await uploadImage(file);
        imageUrls.push(url);
      } catch (err) {
        return next(new AppError(`Error uploading image: ${err.message}`, 500));
      }
    }

    const newProduct = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      images: imageUrls,
      seller: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      message: 'Product listing created successfully',
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

// Get all products with search, filtering, and sorting
const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const query = { isSold: false }; // only display unsold products in general list

    // 1. Search Query
    if (search) {
      // Use text index search or regex as fallback
      query.$text = { $search: search };
    }

    // 2. Category Filter
    if (category && category !== 'All') {
      query.category = category;
    }

    let queryObj = Product.find(query).populate('seller', 'name profilePicture');

    // 3. Sorting
    if (sort === 'priceAsc') {
      queryObj = queryObj.sort('price');
    } else if (sort === 'priceDesc') {
      queryObj = queryObj.sort('-price');
    } else {
      // default: newest first
      queryObj = queryObj.sort('-createdAt');
    }

    const products = await queryObj;

    res.status(200).json({
      status: 'success',
      results: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product details
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email profilePicture');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Update product details or mark as sold
const updateProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, isSold } = req.body;
    
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Ensure the user is the seller of the product
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to edit this product', 403));
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (price !== undefined) updateFields.price = Number(price);
    if (category) updateFields.category = category;
    if (isSold !== undefined) updateFields.isSold = isSold === 'true' || isSold === true;

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      for (const file of req.files) {
        try {
          const url = await uploadImage(file);
          newImageUrls.push(url);
        } catch (err) {
          return next(new AppError(`Error uploading image: ${err.message}`, 500));
        }
      }
      updateFields.images = newImageUrls;
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Check ownership or admin
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('You do not have permission to delete this product', 403));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
