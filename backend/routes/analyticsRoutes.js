const express = require('express');
const protect = require('../middleware/authMiddleware');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();
router.use(protect);

router.get('/', getAnalytics);

module.exports = router;
