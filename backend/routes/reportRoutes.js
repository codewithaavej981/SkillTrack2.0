const express = require('express');
const protect = require('../middleware/authMiddleware');
const { getReportData } = require('../controllers/reportController');

const router = express.Router();

// Require authentication for all report endpoints
router.use(protect);

router.get('/', getReportData);

module.exports = router;
