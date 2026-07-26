const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const { adminLimiter } = require('../middlewares/rateLimiter');
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
  .post(createMenuItem);

router.route('/reorder')
  .put(reorderMenuItems);

router.route('/:id')
  .put(updateMenuItem)
  .delete(deleteMenuItem);

module.exports = router;
