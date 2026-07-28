const express = require('express');
const { categoryValidator } = require('../middlewares/validators');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
const { upload, checkMagicBytes } = require('../middlewares/upload');
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
  .post(upload.single('image'), checkMagicBytes, categoryValidator, createCategory);

router.route('/reorder')
  .put(reorderCategories);

router.route('/:id')
  .put(upload.single('image'), checkMagicBytes, categoryValidator, updateCategory)
  .delete(deleteCategory);

module.exports = router;
