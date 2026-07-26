const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
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
  displayOrder: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

categorySchema.index({ displayOrder: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
