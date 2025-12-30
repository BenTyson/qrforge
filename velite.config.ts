import { defineConfig, defineCollection, s } from 'velite';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';

// Blog posts collection
const blogPosts = defineCollection({
  name: 'BlogPost',
  pattern: 'blog/**/*.mdx',
  schema: s.object({
    title: s.string().max(100),
    description: s.string().max(300),
    date: s.isodate(),
    updated: s.isodate().optional(),
    author: s.string().default('QRWolf Team'),
    category: s.enum(['guides', 'news', 'tutorials', 'case-studies']),
    tags: s.array(s.string()).default([]),
    image: s.string().optional(),
    featured: s.boolean().default(false),
    draft: s.boolean().default(false),
    content: s.mdx(),
    toc: s.toc(),
    metadata: s.metadata(),
  })
    .transform((data, { meta }) => ({
      ...data,
      slug: (meta.basename || meta.path.split('/').pop() || '').replace(/\.mdx$/, ''),
    })),
});

// Learn/Wiki articles collection
const learnArticles = defineCollection({
  name: 'LearnArticle',
  pattern: 'learn/**/*.mdx',
  schema: s.object({
    title: s.string().max(100),
    description: s.string().max(300),
    category: s.enum([
      'qr-basics',
      'how-it-works',
      'use-cases',
      'industries',
      'best-practices',
      'technical',
    ]),
    order: s.number().default(999),
    tags: s.array(s.string()).default([]),
    image: s.string().optional(),
    draft: s.boolean().default(false),
    content: s.mdx(),
    toc: s.toc(),
    metadata: s.metadata(),
    relatedSlugs: s.array(s.string()).default([]),
  })
    .transform((data, { meta }) => ({
      ...data,
      slug: meta.path.split('/').pop()?.replace(/\.mdx$/, '') || '',
    })),
});

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static/content',
    base: '/static/content/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { blogPosts, learnArticles },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      [rehypePrettyCode, {
        theme: 'github-dark',
        keepBackground: true,
      }],
    ],
  },
});
