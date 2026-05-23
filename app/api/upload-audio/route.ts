import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('audio') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string; duration: number }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: 'video', folder: 'chat_voice_notes' }, (err, res) =>
          err ? reject(err) : resolve(res as unknown as { secure_url: string; duration: number })
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, duration: result.duration });
  } catch (e) {
    console.error('upload-audio error:', e);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
