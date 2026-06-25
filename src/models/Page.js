import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // e.g., shipping-policy, return-policy
  content: { type: String, required: true }, // Markdown or HTML body text
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
