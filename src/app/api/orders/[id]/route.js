import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from 'src/lib/mongodb';
import Order from 'src/models/Order';
import { getAuthUser, verifyAdmin } from 'src/lib/auth';

// GET: Fetch order details by ID (MongoDB ID or readable orderId)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const user = getAuthUser(request); // can be null for guest checker

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { orderId: id.toUpperCase() };

    const order = await Order.findOne(query).populate('orderItems.product');
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Protection check: Guest, Owner, or Admin can access
    if (order.user) {
      if (!user || (user.role !== 'admin' && String(order.user) !== String(user._id))) {
        return NextResponse.json(
          { success: false, error: 'Access denied. You do not own this order' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Order fetch details error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update order details/status (Protected: Admin Only)
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { orderId: id.toUpperCase() };

    const order = await Order.findOne(query);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const { orderStatus, paymentStatus, trackingId, courierName } = body;

    // Update fields
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingId !== undefined) order.trackingId = trackingId;
    if (courierName !== undefined) order.courierName = courierName;

    // If order is cancelled, restore stock quantities
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      const Product = mongoose.model('Product');
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
