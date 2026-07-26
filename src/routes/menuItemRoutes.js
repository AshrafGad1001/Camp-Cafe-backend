const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
const upload = require('../middlewares/upload');
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
  .post(upload.single('image'), createMenuItem);

router.route('/reorder')
  .put(reorderMenuItems);

router.route('/:id')
  .put(upload.single('image'), updateMenuItem)
  .delete(deleteMenuItem);

module.exports = router;
