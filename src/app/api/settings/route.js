import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from 'src/lib/prisma';
import { verifyAdmin } from 'src/lib/auth';
import { getPublicSettings, CACHE_TAGS } from 'src/lib/storeData';

export async function GET() {
  try {
    let settings = await getPublicSettings();

    if (!settings) {
      const created = await prisma.setting.create({ data: {} });
      settings = JSON.parse(JSON.stringify(created));
      revalidateTag(CACHE_TAGS.settings);
    }

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
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

    const body = await request.json();
    let settings = await prisma.setting.findFirst();

    const safeData = {
      ...(body.storeName !== undefined && { storeName: body.storeName }),
      ...(body.contactNumber !== undefined && { contactNumber: body.contactNumber }),
      ...(body.whatsappNumber !== undefined && { whatsappNumber: body.whatsappNumber }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.address !== undefined && { address: body.address }),
      ...(body.shippingCharges !== undefined && { shippingCharges: body.shippingCharges }),
      ...(body.freeShippingMinAmount !== undefined && { freeShippingMinAmount: body.freeShippingMinAmount }),
      ...(body.codEnabled !== undefined && { codEnabled: body.codEnabled }),
      ...(body.onlinePaymentEnabled !== undefined && { onlinePaymentEnabled: body.onlinePaymentEnabled }),
      ...(body.taxPercent !== undefined && { taxPercent: body.taxPercent }),
      ...(body.gstDetails !== undefined && { gstDetails: body.gstDetails }),
      ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      ...(body.socialLinks !== undefined && { socialLinks: body.socialLinks }),
    };

    if (!settings) {
      settings = await prisma.setting.create({ data: safeData });
    } else {
      settings = await prisma.setting.update({
        where: { id: settings.id },
        data: safeData
      });
    }

    revalidateTag(CACHE_TAGS.settings);

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
