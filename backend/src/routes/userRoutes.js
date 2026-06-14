const express = require('express');
const { getProfile, updateProfile, getUserProducts } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/profile')
  .get(getProfile)
  .patch(upload.single('profilePicture'), updateProfile);

router.get('/my-products', getUserProducts);

module.exports = router;
