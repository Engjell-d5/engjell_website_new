import { prisma } from '../prisma';
import type { Blog } from './types';

export async function getBlogs(): Promise<Blog[]> {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      author: true,
      campaigns: {
        select: {
          id: true,
          subject: true,
          status: true,
        },
        take: 1, // Just get the first linked campaign
      },
    },
  });
  type BlogType = Awaited<ReturnType<typeof prisma.blog.findMany>>[0];
  return blogs.map((blog: BlogType) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    excerpt: blog.excerpt,
    content: blog.content,
    imageUrl: blog.imageUrl,
    published: blog.published,
    publishedAt: blog.publishedAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    authorId: blog.authorId,
    seo: {
      metaTitle: blog.seoMetaTitle || undefined,
      metaDescription: blog.seoMetaDescription || undefined,
      keywords: blog.seoKeywords || undefined,
      ogTitle: blog.seoOgTitle || undefined,
      ogDescription: blog.seoOgDescription || undefined,
      ogImage: blog.seoOgImage || undefined,
      twitterCard: blog.seoTwitterCard || undefined,
      twitterTitle: blog.seoTwitterTitle || undefined,
      twitterDescription: blog.seoTwitterDescription || undefined,
      twitterImage: blog.seoTwitterImage || undefined,
    },
  }));
}

export interface RelatedBlog {
  id: string;
  title: string;
  slug: string;
  category: string;
  imageUrl: string;
  publishedAt: string | null;
}

// Posts to show under "Keep reading" on an article page.
//
// Two things this deliberately does not do: it does not load every blog row
// (the post page used to call getBlogs(), pulling the full `content` of every
// article on every page view just to pick two), and it does not fall back to
// "most recent" alone, same-category posts come first, which is both better
// for the reader and better topical signal for search.
export async function getRelatedBlogs(
  slug: string,
  category: string,
  limit: number = 2
): Promise<RelatedBlog[]> {
  const select = {
    id: true,
    title: true,
    slug: true,
    category: true,
    imageUrl: true,
    publishedAt: true,
  } as const;

  const sameCategory = await prisma.blog.findMany({
    where: { published: true, slug: { not: slug }, category },
    // nulls last: Postgres sorts NULLs first on DESC, which would float a
    // published-but-undated post to the top of "Keep reading".
    orderBy: { publishedAt: { sort: 'desc', nulls: 'last' } },
    take: limit,
    select,
  });

  // Top up with the most recent posts from any category if this one is thin.
  let results = sameCategory;
  if (results.length < limit) {
    const filler = await prisma.blog.findMany({
      where: {
        published: true,
        slug: { not: slug },
        id: { notIn: results.map((b) => b.id) },
      },
      orderBy: { publishedAt: { sort: 'desc', nulls: 'last' } },
      take: limit - results.length,
      select,
    });
    results = [...results, ...filler];
  }

  return results.map((blog) => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    imageUrl: blog.imageUrl,
    publishedAt: blog.publishedAt?.toISOString() || null,
  }));
}

export async function getBlog(id: string): Promise<Blog | null> {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: { 
      author: true,
      campaigns: {
        select: {
          id: true,
          subject: true,
          status: true,
        },
        take: 1, // Just get the first linked campaign
      },
    },
  });
  
  if (!blog) return null;
  
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    excerpt: blog.excerpt,
    content: blog.content,
    imageUrl: blog.imageUrl,
    published: blog.published,
    publishedAt: blog.publishedAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    authorId: blog.authorId,
    seo: {
      metaTitle: blog.seoMetaTitle || undefined,
      metaDescription: blog.seoMetaDescription || undefined,
      keywords: blog.seoKeywords || undefined,
      ogTitle: blog.seoOgTitle || undefined,
      ogDescription: blog.seoOgDescription || undefined,
      ogImage: blog.seoOgImage || undefined,
      twitterCard: blog.seoTwitterCard || undefined,
      twitterTitle: blog.seoTwitterTitle || undefined,
      twitterDescription: blog.seoTwitterDescription || undefined,
      twitterImage: blog.seoTwitterImage || undefined,
    },
  };
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: { 
      author: true,
      campaigns: {
        select: {
          id: true,
          subject: true,
          status: true,
        },
        take: 1,
      },
    },
  });
  
  if (!blog) return null;
  
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    category: blog.category,
    excerpt: blog.excerpt,
    content: blog.content,
    imageUrl: blog.imageUrl,
    published: blog.published,
    publishedAt: blog.publishedAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    authorId: blog.authorId,
    seo: {
      metaTitle: blog.seoMetaTitle || undefined,
      metaDescription: blog.seoMetaDescription || undefined,
      keywords: blog.seoKeywords || undefined,
      ogTitle: blog.seoOgTitle || undefined,
      ogDescription: blog.seoOgDescription || undefined,
      ogImage: blog.seoOgImage || undefined,
      twitterCard: blog.seoTwitterCard || undefined,
      twitterTitle: blog.seoTwitterTitle || undefined,
      twitterDescription: blog.seoTwitterDescription || undefined,
      twitterImage: blog.seoTwitterImage || undefined,
    },
  };
}

export async function getBlogCampaign(blogId: string): Promise<{ id: string; subject: string; status: string } | null> {
  const campaign = await prisma.campaign.findFirst({
    where: { blogId },
    select: {
      id: true,
      subject: true,
      status: true,
    },
  });
  
  return campaign;
}

export async function saveBlogs(blogs: Blog[]): Promise<void> {
  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: {
        title: blog.title,
        category: blog.category,
        excerpt: blog.excerpt,
        content: blog.content,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        authorId: blog.authorId,
        seoMetaTitle: blog.seo?.metaTitle || null,
        seoMetaDescription: blog.seo?.metaDescription || null,
        seoKeywords: blog.seo?.keywords || null,
        seoOgTitle: blog.seo?.ogTitle || null,
        seoOgDescription: blog.seo?.ogDescription || null,
        seoOgImage: blog.seo?.ogImage || null,
        seoTwitterCard: blog.seo?.twitterCard || null,
        seoTwitterTitle: blog.seo?.twitterTitle || null,
        seoTwitterDescription: blog.seo?.twitterDescription || null,
        seoTwitterImage: blog.seo?.twitterImage || null,
        updatedAt: new Date(blog.updatedAt),
      },
      create: {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        excerpt: blog.excerpt,
        content: blog.content,
        imageUrl: blog.imageUrl,
        published: blog.published,
        publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : null,
        authorId: blog.authorId,
        createdAt: new Date(blog.createdAt),
        updatedAt: new Date(blog.updatedAt),
        seoMetaTitle: blog.seo?.metaTitle || null,
        seoMetaDescription: blog.seo?.metaDescription || null,
        seoKeywords: blog.seo?.keywords || null,
        seoOgTitle: blog.seo?.ogTitle || null,
        seoOgDescription: blog.seo?.ogDescription || null,
        seoOgImage: blog.seo?.ogImage || null,
        seoTwitterCard: blog.seo?.twitterCard || null,
        seoTwitterTitle: blog.seo?.twitterTitle || null,
        seoTwitterDescription: blog.seo?.twitterDescription || null,
        seoTwitterImage: blog.seo?.twitterImage || null,
      },
    });
  }
}

