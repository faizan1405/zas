import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Apex Cricket' },
  contactNumber: { type: String, default: '+1 (555) 123-4567' },
  whatsappNumber: { type: String, default: '+15551234567' },
  email: { type: String, default: 'support@apexcricket.com' },
  address: { type: String, default: '123 Cricket Stadium Road, Sports City' },
  shippingCharges: { type: Number, default: 10 },
  freeShippingMinAmount: { type: Number, default: 100 },
  codEnabled: { type: Boolean, default: true },
  onlinePaymentEnabled: { type: Boolean, default: true },
  taxPercent: { type: Number, default: 12 },
  logoUrl: { type: String, default: '' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
