import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // E.g., APX-29381-IND
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Null for guest checkouts
  guestDetails: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedVariant: {
      size: { type: String },
      color: { type: String },
      handOrientation: { type: String },
      batWoodType: { type: String },
      ballType: { type: String }
    }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['COD', 'Online'], required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], 
    default: 'Pending' 
  },
  trackingId: { type: String, default: '' },
  courierName: { type: String, default: '' },
  shippingPrice: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
