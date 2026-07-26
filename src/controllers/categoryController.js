const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const count = await Category.countDocuments();
    const category = await Category.create({ name, displayOrder: count + 1 });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    await MenuItem.deleteMany({ category: req.params.id });
    await category.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.reorderCategories = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    
    await Promise.all(
      orderedIds.map((id, index) => 
        Category.findByIdAndUpdate(id, { displayOrder: index + 1 })
      )
    );
    
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
