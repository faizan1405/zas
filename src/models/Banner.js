import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String, required: true }, // Image URL
  link: { type: String, default: '/shop' },
  type: { type: String, enum: ['hero', 'offer'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
