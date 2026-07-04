import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from 'src/lib/mongodb';
import Setting from 'src/models/Setting';
import { verifyAdmin } from 'src/lib/auth';
import { getPublicSettings, CACHE_TAGS } from 'src/lib/storeData';

// GET: Fetch store configurations (Open to everyone) — cached, revalidated on save.
export async function GET() {
  try {
    let settings = await getPublicSettings();

    // Create default settings if none exist yet, then refresh the cache.
    if (!settings) {
      await dbConnect();
      const created = await Setting.create({});
      settings = JSON.parse(JSON.stringify(created.toObject()));
      revalidateTag(CACHE_TAGS.settings, { expire: 0 });
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

// PUT: Update store configurations (Protected: Admin Only)
export async function PUT(request) {
  try {
    await dbConnect();
    const isAdmin = verifyAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let settings = await Setting.findOne();

    if (!settings) {
      settings = await Setting.create(body);
    } else {
      settings = await Setting.findByIdAndUpdate(
        settings._id,
        { $set: body },
        { new: true, runValidators: true }
      );
    }

    revalidateTag(CACHE_TAGS.settings, { expire: 0 });

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
