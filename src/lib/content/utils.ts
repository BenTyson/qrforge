/**
 * Content utilities for blog and learn sections
 */

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getReadingTime(wordCount: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
}

export const LEARN_CATEGORIES = [
  { slug: 'qr-basics', label: 'QR Basics', description: 'Foundational knowledge for beginners' },
  { slug: 'how-it-works', label: 'How It Works', description: 'Technical deep-dives made accessible' },
  { slug: 'use-cases', label: 'Use Cases', description: 'Practical applications for every need' },
  { slug: 'industries', label: 'Industries', description: 'Vertical-specific guides' },
  { slug: 'best-practices', label: 'Best Practices', description: 'Tips and optimization strategies' },
  { slug: 'technical', label: 'Technical', description: 'Developer-focused content' },
] as const;

export const BLOG_CATEGORIES = [
  { slug: 'guides', label: 'Guides', description: 'Step-by-step tutorials' },
  { slug: 'news', label: 'News', description: 'Industry updates and trends' },
  { slug: 'tutorials', label: 'Tutorials', description: 'How-to content' },
  { slug: 'case-studies', label: 'Case Studies', description: 'Real-world success stories' },
] as const;

export type LearnCategory = typeof LEARN_CATEGORIES[number]['slug'];
export type BlogCategory = typeof BLOG_CATEGORIES[number]['slug'];
