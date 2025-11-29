import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getBlogs, saveBlogs, Blog } from '@/lib/data';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const blogs = getBlogs();
  const blog = blogs.find(b => b.id === params.id);
  
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { title, slug, category, excerpt, content, imageUrl, published, seo } = await request.json();
    const blogs = getBlogs();
    const blogIndex = blogs.findIndex(b => b.id === params.id);

    if (blogIndex === -1) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Handle slug update
    let finalSlug = blogs[blogIndex].slug;
    if (slug && slug !== blogs[blogIndex].slug) {
      finalSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let counter = 1;
      while (blogs.find(b => b.slug === finalSlug && b.id !== params.id)) {
        finalSlug = `${slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${counter}`;
        counter++;
      }
    } else if (title && title !== blogs[blogIndex].title && !slug) {
      // Auto-generate slug if title changed and slug not provided
      const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      finalSlug = generatedSlug;
      let counter = 1;
      while (blogs.find(b => b.slug === finalSlug && b.id !== params.id)) {
        finalSlug = `${generatedSlug}-${counter}`;
        counter++;
      }
    }

    const updatedBlog: Blog = {
      ...blogs[blogIndex],
      title: title || blogs[blogIndex].title,
      slug: finalSlug,
      category: category || blogs[blogIndex].category,
      excerpt: excerpt || blogs[blogIndex].excerpt,
      content: content || blogs[blogIndex].content,
      imageUrl: imageUrl || blogs[blogIndex].imageUrl,
      published: published !== undefined ? published : blogs[blogIndex].published,
      publishedAt: published && !blogs[blogIndex].publishedAt 
        ? new Date().toISOString() 
        : blogs[blogIndex].publishedAt,
      updatedAt: new Date().toISOString(),
      seo: seo !== undefined ? seo : blogs[blogIndex].seo,
    };

    blogs[blogIndex] = updatedBlog;
    saveBlogs(blogs);

    return NextResponse.json({ blog: updatedBlog });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getAuthUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const blogs = getBlogs();
    const filteredBlogs = blogs.filter(b => b.id !== params.id);
    
    if (filteredBlogs.length === blogs.length) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    saveBlogs(filteredBlogs);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

