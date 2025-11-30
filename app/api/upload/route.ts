import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, openSync, closeSync, fsyncSync } from 'fs';

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - support both images and videos
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    const validTypes = [...validImageTypes, ...validVideoTypes];
    const isVideo = validVideoTypes.includes(file.type);
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: images (${validImageTypes.join(', ')}) or videos (${validVideoTypes.join(', ')})` },
        { status: 400 }
      );
    }

    // Validate file size
    // Instagram requirements: 8MB max for images, but we allow larger for general use
    // Videos: 200MB max (for general use, Instagram has different limits)
    const maxSize = isVideo ? 200 * 1024 * 1024 : 20 * 1024 * 1024; // 200MB for videos, 20MB for images
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size too large. Maximum size is ${isVideo ? '200MB' : '20MB'}.` },
        { status: 400 }
      );
    }

    // Warn about Instagram-specific requirements for images
    if (!isVideo && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
      console.warn(`[UPLOAD] Warning: Image format is ${file.type}. For Instagram posting, images must be JPEG format. Consider converting before posting.`);
    }
    
    // Warn if image is too large for Instagram (8MB limit)
    if (!isVideo && file.size > 8 * 1024 * 1024) {
      console.warn(`[UPLOAD] Warning: Image size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds Instagram's 8MB limit. The image may be rejected by Instagram.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${randomStr}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Save file and ensure it's fully written to disk
    // NOTE: Images are saved at original resolution and quality - no resizing or compression is applied
    await writeFile(filepath, buffer);

    // Force file system sync to ensure file is fully written
    const fd = openSync(filepath, 'r+');
    fsyncSync(fd);
    closeSync(fd);

    // Return the URL pointing to the API route (serves files dynamically)
    // This ensures images/videos are available immediately without needing to restart the app
    const url = `/api/uploads/${filename}`;
    const fileType = isVideo ? 'video' : 'image';
    return NextResponse.json({ 
      url, 
      filename,
      type: fileType,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

