import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Optional: Google sign-in accounts have no password. Admin (seeded) still uses one.
  password: { type: String },
  // Sign-in source. Customers authenticate via Google; admin via credentials.
  provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
  googleId: { type: String, index: true, sparse: true },
  avatar: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [{
    fullName: { type: String },
    addressLine: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isBlocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
