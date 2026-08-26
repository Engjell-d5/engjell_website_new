import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBlogs } from '@/lib/data';

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  const blogs = await getBlogs();
  
  // If not authenticated, only return published blogs
  if (!authUser) {
    const publishedBlogs = blogs.filter(b => b.published);
    return NextResponse.json({ blogs: publishedBlogs });
  }

  // If authenticated, return all blogs
  return NextResponse.json({ blogs });
}
