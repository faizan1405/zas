import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { getAuthUser, verifyAdmin } from 'src/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = getAuthUser(request);

    // Id can be either the Prisma CUID or the readable orderId
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { orderId: id.toUpperCase() }
        ]
      },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId) {
      if (!user || (user.role !== 'admin' && order.userId !== user.id)) {
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
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: id },
          { orderId: id.toUpperCase() }
        ]
      },
      include: { orderItems: true }
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const { orderStatus, paymentStatus, trackingId, courierName } = body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingId !== undefined) updateData.trackingId = trackingId;
    if (courierName !== undefined) updateData.courierName = courierName;

    // Use transaction if stock restoration is needed
    if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: updateData
        });

        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      });
      
      const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } });
      return NextResponse.json({
        success: true,
        message: 'Order updated successfully',
        order: updatedOrder
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
