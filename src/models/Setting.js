import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'Zassports' },
  contactNumber: { type: String, default: '8860654659' },
  whatsappNumber: { type: String, default: '918860654659' },
  email: { type: String, default: 'info@zassports.com' },
  address: { type: String, default: 'Main Road, Deepak Vihar, Near Indus Valley Public School, Khora Colony, Noida Sector 62, Uttar Pradesh – 201309' },
  shippingCharges: { type: Number, default: 100 },
  freeShippingMinAmount: { type: Number, default: 999 },
  codEnabled: { type: Boolean, default: true },
  onlinePaymentEnabled: { type: Boolean, default: true },
  taxPercent: { type: Number, default: 12 },
  gstDetails: { type: String, default: '09AACCZ4143L1ZY' },
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
