import { NextResponse } from 'next/server';
import { getBlogs } from '@/lib/data';

/**
 * Published posts, for the public sidebar's "Latest Blog".
 *
 * The content itself comes from d5; this stays only because the sidebar
 * is a client component and needs an endpoint to call. It used to vary
 * its response for authenticated admins, which is moot now that the site
 * has no admin and nothing can authenticate.
 */
export async function GET() {
  const blogs = await getBlogs();
  return NextResponse.json({ blogs: blogs.filter((b) => b.published) });
}
