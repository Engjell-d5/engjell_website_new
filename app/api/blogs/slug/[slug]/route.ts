import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBlogs } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const blogs = getBlogs();
  const blog = blogs.find(b => b.slug === params.slug);
  
  if (!blog) {
    return NextResponse.json(
      { error: 'Blog not found' },
      { status: 404 }
    );
  }

  const authUser = getAuthUser(request);
  if (!blog.published && !authUser) {
    return NextResponse.json(
      { error: 'Blog not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ blog });
}

