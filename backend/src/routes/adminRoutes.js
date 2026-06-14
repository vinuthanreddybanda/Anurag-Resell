const express = require('express');
const {
  getAllUsers,
  getAllProducts,
  getAllReports,
  banUser,
  unbanUser,
  deleteProductAdmin,
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, restrictTo('admin'));

router.get('/users', getAllUsers);
router.get('/products', getAllProducts);
router.get('/reports', getAllReports);

router.post('/users/:userId/ban', banUser);
router.post('/users/:userId/unban', unbanUser);
router.delete('/products/:productId', deleteProductAdmin);

module.exports = router;
