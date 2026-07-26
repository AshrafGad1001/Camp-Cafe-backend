const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');

exports.getMenuItems = async (req, res, next) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    
    const items = await MenuItem.find(query)
      .sort({ displayOrder: 1 })
      .populate('category', 'name');
      
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Category not found' });
    }
    
    const count = await MenuItem.countDocuments({ category });
    
    const item = await MenuItem.create({
      name,
      description,
      price,
      category,
      isAvailable,
      displayOrder: count + 1
    });
    
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ success: false, message: 'Category not found' });
      }
    }
    
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'MenuItem not found' });
    }
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'MenuItem not found' });
    }
    
    await item.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.reorderMenuItems = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    
    await Promise.all(
      orderedIds.map((id, index) => 
        MenuItem.findByIdAndUpdate(id, { displayOrder: index + 1 })
      )
    );
    
    const items = await MenuItem.find({ _id: { $in: orderedIds } }).sort({ displayOrder: 1 });
    
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
