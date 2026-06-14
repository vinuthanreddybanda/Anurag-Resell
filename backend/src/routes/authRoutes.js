const express = require('express');
const { register, verifyOTP, login, logout } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Apply auth rate limiting to registration and login
router.post('/register', authLimiter, validateRegister, register);
router.post('/verify-otp', verifyOTP);
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);

module.exports = router;
