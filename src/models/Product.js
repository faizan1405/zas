import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  specs: { type: Map, of: String }, // Key-value pairs for technical specifications
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // Percentage, e.g., 20%
  stock: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  variants: {
    sizes: [String],
    colors: [String],
    handOrientations: [String],
    batWoodTypes: [String],
    ballTypes: [String],
    playingLevels: [String],
    ageGroups: [String],
  },
  images: [String], // Array of Cloudinary image URLs
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isFeatured: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  category: { type: String, required: true }, // Slug of the category
  subcategory: { type: String }, // Slug of the subcategory
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
