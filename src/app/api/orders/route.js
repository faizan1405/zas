import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Order from 'src/models/Order';
import Product from 'src/models/Product';
import Coupon from 'src/models/Coupon';
import Setting from 'src/models/Setting';
import { getAuthUser, verifyAdmin } from 'src/lib/auth';

// 1. GET: Fetch orders list.
// If admin, returns all orders. If customer, returns customer's orders.
export async function GET(request) {
  try {
    await dbConnect();
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in' },
        { status: 401 }
      );
    }

    let orders;
    if (user.role === 'admin') {
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
    }

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 2. POST: Secure Order Placement (Verifies stock & price on server)
export async function POST(request) {
  try {
    await dbConnect();
    const user = getAuthUser(request); // Null for guest checkouts
    const body = await request.json();

    const { 
      orderItems = [], 
      shippingAddress, 
      paymentMethod, 
      couponCode = '', 
      guestDetails 
    } = body;

    // Validation
    if (orderItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      return NextResponse.json({ success: false, error: 'Complete shipping address is required' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ success: false, error: 'Payment method is required' }, { status: 400 });
    }
    if (!user && (!guestDetails || !guestDetails.name || !guestDetails.email || !guestDetails.phone)) {
      return NextResponse.json({ success: false, error: 'Guest checkout requires contact details' }, { status: 400 });
    }

    // Fetch store settings for shipping rules
    const settings = await Setting.findOne() || {
      shippingCharges: 10,
      freeShippingMinAmount: 100
    };

    let subtotal = 0;
    const validatedItems = [];

    // Verify stock and price on server from DB
    for (const item of orderItems) {
      const product = await Product.findById(item.product._id || item.product);
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product with SKU ${item.sku || 'Unknown'} not found` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product '${product.name}' is no longer available for purchase` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for product '${product.name}'. Only ${product.stock} items left.` },
          { status: 400 }
        );
      }

      // Calculate server price
      const itemPrice = product.price;
      const itemSubtotal = itemPrice * item.quantity;
      subtotal += itemSubtotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images[0] || '',
        price: itemPrice,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant || {}
      });
    }

    // Validate coupon code if applied
    let discountAmount = 0;
    let validCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        const expiry = new Date(coupon.expiryDate);
        
        if (now <= expiry && subtotal >= coupon.minOrderValue && coupon.usedCount < coupon.usageLimit) {
          validCoupon = coupon;
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
        }
      }
    }

    // Calculate shipping charges
    const shippingPrice = subtotal >= settings.freeShippingMinAmount ? 0 : settings.shippingCharges;
    const totalAmount = subtotal - discountAmount + shippingPrice;

    // Generate readable order ID: ZAS-#####-IND
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ZAS-${randomNum}-IND`;

    // Create the order entry
    const newOrder = await Order.create({
      orderId,
      user: user ? user._id : null,
      guestDetails: user ? null : guestDetails,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'Online' ? 'Paid' : 'Pending', // mock online payment auto-paid
      orderStatus: 'Pending',
      shippingPrice,
      discountAmount,
      subtotal,
      totalAmount,
      couponCode: validCoupon ? validCoupon.code : ''
    });

    // Reduce product stock & increment coupon counts in DB
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    if (validCoupon) {
      await Coupon.findByIdAndUpdate(validCoupon._id, {
        $inc: { usedCount: 1 }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: newOrder
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
