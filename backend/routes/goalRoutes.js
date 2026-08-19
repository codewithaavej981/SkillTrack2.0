const express = require('express');
const protect = require('../middleware/authMiddleware');
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');

const router = express.Router();
router.use(protect);
router.route('/').get(getGoals).post(createGoal);
router.route('/:id').put(updateGoal).delete(deleteGoal);

module.exports = router;
