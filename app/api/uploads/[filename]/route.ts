import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// This endpoint must be publicly accessible (no authentication)
// Instagram/Facebook servers need to fetch images directly

export const dynamic = 'force-dynamic';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Handle HEAD requests (Instagram may use HEAD to check if file exists)
export async function HEAD(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filepath = join(process.cwd(), 'public', 'uploads', filename);

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse(null, { status: 400 });
    }

    if (!existsSync(filepath)) {
      return new NextResponse(null, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
    },
  });
    }

    const extension = filename.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
    };
    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    console.log('[UPLOADS] Request for file:', filename, 'from:', userAgent);
    
    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      console.error('[UPLOADS] Invalid filename (directory traversal attempt):', filename);
      return new NextResponse('Invalid filename', { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const filepath = join(process.cwd(), 'public', 'uploads', filename);
    console.log('[UPLOADS] Looking for file at:', filepath);

    // Check if file exists
    if (!existsSync(filepath)) {
      console.error('[UPLOADS] File not found:', filepath);
      return new NextResponse('File not found', { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        },
      });
    }

    // Read the file
    const fileBuffer = await readFile(filepath);
    console.log('[UPLOADS] File found, size:', fileBuffer.length, 'bytes');

    // Determine content type based on file extension
    const extension = filename.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
    };
    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

    // Return the file with appropriate headers
    // Critical: These headers must allow Instagram/Facebook servers to fetch the image
    const headers = {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400, must-revalidate',
        // CORS headers to allow Instagram/Facebook servers to fetch images
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
      // Additional headers for better compatibility
      'Accept-Ranges': 'bytes',
      'X-Content-Type-Options': 'nosniff',
    };

    console.log('[UPLOADS] Serving file with content-type:', contentType);
    
    return new NextResponse(fileBuffer, {
      headers,
    });
  } catch (error) {
    console.error('[UPLOADS] Error serving file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new NextResponse(`Internal server error: ${errorMessage}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      },
    });
  }
}
