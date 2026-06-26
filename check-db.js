const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Manually parse .env file
const envPath = path.join(__dirname, '.env');
console.log('Reading .env from:', envPath);
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  console.error('Failed to read .env file', err.message);
  process.exit(1);
}

let mongodbUri = '';
if (envContent) {
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('MONGODB_URI=')) {
      mongodbUri = line.trim().split('MONGODB_URI=')[1];
      break;
    }
  }
}

if (!mongodbUri) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}

// Extract clean URI if there are comments or spaces
mongodbUri = mongodbUri.split('#')[0].trim();
console.log('Using MongoDB URI:', mongodbUri.replace(/:([^@]+)@/, ':****@'));

// Define temporary schemas to query
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  isActive: Boolean
}, { collection: 'categories' });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: String,
  category: String,
  price: Number,
  stock: Number
}, { collection: 'products' });

async function run() {
  try {
    await mongoose.connect(mongodbUri);
    console.log('Connected to MongoDB successfully!');
    
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
    const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    
    const categories = await Category.find({});
    console.log(`\n--- Categories (${categories.length}) ---`);
    categories.forEach(c => {
      console.log(`- ${c.name} (slug: ${c.slug}, active: ${c.isActive})`);
    });
    
    const products = await Product.find({});
    console.log(`\n--- Products (${products.length}) ---`);
    products.forEach(p => {
      console.log(`- ${p.name} (slug: ${p.slug}, category: ${p.category}, price: ${p.price}, stock: ${p.stock})`);
    });
    
  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected.');
  }
}

run();
