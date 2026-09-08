import { NextResponse } from 'next/server';
import {
  MAX_IMAGE_SIZE,
  UploadValidationError,
  uploadImage,
} from 'src/lib/storage';
import { verifyAdmin } from 'src/lib/auth';

export async function POST(request) {
  try {
    const isAdmin = verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json(
        { success: false, error: 'No file provided for upload' },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds the 5MB limit.' },
        { status: 413 }
      );
    }

    const result = await uploadImage(file);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error('File upload API error:', error);
    return NextResponse.json(
      { success: false, error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
