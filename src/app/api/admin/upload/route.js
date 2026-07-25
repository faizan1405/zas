import { NextResponse } from 'next/server';
import { uploadImage } from 'src/lib/storage';
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

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided for upload' },
        { status: 400 }
      );
    }

    // Convert uploaded file buffer into base64 data uri
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Save image locally
    const result = await uploadImage(base64Image);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('File upload API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
