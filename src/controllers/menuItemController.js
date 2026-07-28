const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
};

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

    let parsedHasSizes = req.body.hasSizes === 'true' || req.body.hasSizes === true;
    let parsedIsBestSeller = req.body.isBestSeller === 'true' || req.body.isBestSeller === true;
    
    if (parsedIsBestSeller) {
      const bestSellerCount = await MenuItem.countDocuments({ isBestSeller: true });
      if (bestSellerCount >= 10) {
        return res.status(400).json({ success: false, message: 'لا يمكن إضافة أكثر من 10 عناصر لقائمة الأكثر مبيعاً' });
      }
    }
    
    let parsedSizes = [];

    if (parsedHasSizes) {
      if (req.body.sizes) {
        try {
          parsedSizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
        } catch (e) {
          return res.status(400).json({ success: false, message: 'Invalid sizes format' });
        }
      }
      const validSizes = parsedSizes.filter(s => s.name && Number(s.price) > 0);
      if (validSizes.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one valid size is required' });
      }
      parsedSizes = validSizes;
    }

    const itemData = {
      name,
      description,
      price: parsedHasSizes ? null : price,
      category,
      isAvailable,
      isBestSeller: parsedIsBestSeller,
      hasSizes: parsedHasSizes,
      sizes: parsedSizes,
      displayOrder: count + 1,
    };

    // Handle image upload if a file is provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'campcafe/items');
      itemData.image = result;
    }

    const item = await MenuItem.create(itemData);
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

    const item = await MenuItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'MenuItem not found' });
    }

    if (req.body.isBestSeller !== undefined) {
      const parsedIsBestSeller = req.body.isBestSeller === 'true' || req.body.isBestSeller === true;
      if (parsedIsBestSeller && !item.isBestSeller) {
        const bestSellerCount = await MenuItem.countDocuments({ isBestSeller: true });
        if (bestSellerCount >= 10) {
          return res.status(400).json({ success: false, message: 'لا يمكن إضافة أكثر من 10 عناصر لقائمة الأكثر مبيعاً' });
        }
      }
      req.body.isBestSeller = parsedIsBestSeller;
    }

    let parsedHasSizes = req.body.hasSizes === 'true' || req.body.hasSizes === true;
    let parsedSizes = [];

    if (req.body.hasSizes !== undefined) {
      if (parsedHasSizes) {
        if (req.body.sizes) {
          try {
            parsedSizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
          } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid sizes format' });
          }
        }
        const validSizes = parsedSizes.filter(s => s.name && Number(s.price) > 0);
        if (validSizes.length === 0) {
          return res.status(400).json({ success: false, message: 'At least one valid size is required' });
        }
        req.body.sizes = validSizes;
      } else {
        req.body.sizes = [];
      }
      req.body.hasSizes = parsedHasSizes;
      if (parsedHasSizes) {
        req.body.price = null;
      }
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (item.image && item.image.publicId) {
        await cloudinary.uploader.destroy(item.image.publicId);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'campcafe/items');
      req.body.image = result;
    }

    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updated });
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

    // Delete image from Cloudinary
    if (item.image && item.image.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
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

exports.getBestSellers = async (req, res, next) => {
  try {
    const items = await MenuItem.find({ isBestSeller: true })
      .populate('category', 'name');

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};
