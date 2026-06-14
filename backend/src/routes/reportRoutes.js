const express = require('express');
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { validateReport } = require('../validators/reportValidator');

const router = express.Router();

router.post('/', protect, validateReport, createReport);

module.exports = router;
