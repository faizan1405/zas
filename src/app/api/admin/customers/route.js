import { NextResponse } from 'next/server';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';

export async function GET(request) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const query = { role: 'customer' };
    if (search) {
      query.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }

    const customers = await prisma.user.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        avatar: true,
        role: true,
        addresses: true,
        isBlocked: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      customers
    });

  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const { id, isBlocked } = await request.json();

    if (!id || isBlocked === undefined) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and block status are required' },
        { status: 400 }
      );
    }

    const customer = await prisma.user.update({
      where: { id, role: 'customer' },
      data: { isBlocked },
      select: {
        id: true,
        name: true,
        email: true,
        provider: true,
        avatar: true,
        role: true,
        addresses: true,
        isBlocked: true,
        createdAt: true,
      }
    }).catch(() => null);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Customer account ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      customer
    });

  } catch (error) {
    console.error('Customer block error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
