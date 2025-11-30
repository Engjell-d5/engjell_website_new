/**
 * Calculate estimated reading time for a blog post
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  // Remove HTML tags to get text content
  const text = content.replace(/<[^>]*>/g, '');
  
  // Split by whitespace and filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  
  // Average reading speed: 200 words per minute
  const wordsPerMinute = 200;
  const readingTime = Math.ceil(words.length / wordsPerMinute);
  
  // Minimum reading time is 1 minute
  return Math.max(1, readingTime);
}
