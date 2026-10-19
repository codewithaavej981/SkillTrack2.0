const express = require('express');
const protect = require('../middleware/authMiddleware');
const { getSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');

const router = express.Router();
router.use(protect);
router.route('/').get(getSkills).post(createSkill);
router.route('/:id').put(updateSkill).delete(deleteSkill);

module.exports = router;
