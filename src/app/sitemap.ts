import { MetadataRoute } from 'next';
import { blogPosts, learnArticles } from '#content';
import { BLOG_CATEGORIES, LEARN_CATEGORIES } from '@/lib/content/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrwolf.com';
  const lastModified = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    // Content hub pages
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Blog posts
  const blogEntries: MetadataRoute.Sitemap = (blogPosts || [])
    .filter(post => !post.draft)
    .map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated || post.date),
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.9 : 0.7,
    }));

  // Learn articles
  const learnEntries: MetadataRoute.Sitemap = (learnArticles || [])
    .filter(article => !article.draft)
    .map(article => ({
      url: `${baseUrl}/learn/${article.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

  // Blog category pages
  const blogCategoryEntries: MetadataRoute.Sitemap = BLOG_CATEGORIES.map(cat => ({
    url: `${baseUrl}/blog/category/${cat.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Learn category pages
  const learnCategoryEntries: MetadataRoute.Sitemap = LEARN_CATEGORIES.map(cat => ({
    url: `${baseUrl}/learn/category/${cat.slug}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...blogEntries,
    ...learnEntries,
    ...blogCategoryEntries,
    ...learnCategoryEntries,
  ];
}
