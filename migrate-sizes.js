const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const MenuItem = require('./src/models/MenuItem');

const migrateSizes = async () => {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all items that don't have the hasSizes field
    const itemsToUpdate = await MenuItem.find({ hasSizes: { $exists: false } });
    console.log(`Found ${itemsToUpdate.length} items to migrate.`);

    if (itemsToUpdate.length > 0) {
      const result = await MenuItem.updateMany(
        { hasSizes: { $exists: false } },
        { 
          $set: { 
            hasSizes: false, 
            sizes: [] 
          } 
        }
      );
      
      console.log(`Migration complete. Modified ${result.modifiedCount} items.`);
    } else {
      console.log('No items needed migration.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateSizes();
