import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String }, // Image URL
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Public category listing filters on isActive and sorts by displayOrder.
CategorySchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
