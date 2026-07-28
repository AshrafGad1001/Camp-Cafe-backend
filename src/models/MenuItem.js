const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: false,
    default: null,
  },
  hasSizes: {
    type: Boolean,
    default: false,
  },
  sizes: [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    }
  }],
  image: {
    url: {
      type: String,
      default: '',
    },
    publicId: {
      type: String,
      default: '',
    },
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

menuItemSchema.index({ category: 1, displayOrder: 1 });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;
