const express = require('express');
const { menuItemValidator } = require('../middlewares/validators');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
const { upload, checkMagicBytes } = require('../middlewares/upload');
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} = require('../controllers/menuItemController');

// All routes are protected & rate-limited
router.use(protect);
router.use(adminLimiter);

router.route('/')
  .get(getMenuItems)
  .post(upload.single('image'), checkMagicBytes, menuItemValidator, createMenuItem);

router.route('/best-sellers')
  .get(require('../controllers/menuItemController').getBestSellers);

router.route('/reorder')
  .put(reorderMenuItems);

router.route('/:id')
  .put(upload.single('image'), checkMagicBytes, menuItemValidator, updateMenuItem)
  .delete(deleteMenuItem);

module.exports = router;
