const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { validateProduct } = require('../validators/productValidator');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes
router.use(protect);

router.post(
  '/',
  upload.array('images', 5), // Accept up to 5 product images
  validateProduct,
  createProduct
);

router.route('/:id')
  .patch(upload.array('images', 5), updateProduct)
  .delete(deleteProduct);

module.exports = router;
