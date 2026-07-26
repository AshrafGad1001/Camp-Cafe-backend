const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require('../controllers/categoryController');

// All routes are protected & rate-limited
router.use(protect);
router.use(adminLimiter);

router.route('/')
  .get(getCategories)
  .post(createCategory);

router.route('/reorder')
  .put(reorderCategories);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
