import { NextResponse } from 'next/server';
import dbConnect from 'src/lib/mongodb';
import Setting from 'src/models/Setting';
import { verifyAdmin } from 'src/lib/auth';

// GET: Fetch store configurations (Open to everyone)
export async function GET() {
  try {
    await dbConnect();
    let settings = await Setting.findOne();
    
    // Create default settings if not exists
    if (!settings) {
      settings = await Setting.create({});
    }

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
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
