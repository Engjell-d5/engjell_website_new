import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBlogs, saveBlogs, Blog } from '@/lib/data';

export async function GET(request: NextRequest) {
  const authUser = getAuthUser(request);
  const blogs = getBlogs();
  
  // If not authenticated, only return published blogs
  if (!authUser) {
    const publishedBlogs = blogs.filter(b => b.published);
    return NextResponse.json({ blogs: publishedBlogs });
  }

  // If authenticated, return all blogs
  return NextResponse.json({ blogs });
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { title, slug, category, excerpt, content, imageUrl, published, seo } = await request.json();

    if (!title || !slug || !category || !excerpt || !content || !imageUrl) {
      return NextResponse.json(
        { error: 'All required fields are missing' },
        { status: 400 }
      );
    }

    const blogs = getBlogs();
    
    // Ensure unique slug
    let finalSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let counter = 1;
    while (blogs.find(b => b.slug === finalSlug)) {
      finalSlug = `${slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${counter}`;
      counter++;
    }

    const newBlog: Blog = {
      id: Date.now().toString(),
      title,
      slug: finalSlug,
      category,
      excerpt,
      content,
      imageUrl,
      published: published || false,
      publishedAt: published ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: user.id,
      seo: seo || undefined,
    };

    blogs.push(newBlog);
    saveBlogs(blogs);

    return NextResponse.json({ blog: newBlog }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

