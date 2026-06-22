import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context: { site: string }) {
  const blog = await getCollection('blog');
  const news = await getCollection('news');

  const items = [
    ...blog.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description,
      link: `/blog/${entry.id}/`,
    })),
    ...news.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.body,
      link: `/news/${entry.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'micromodels',
    description: 'Perspectives on AI/ML from the trenches.',
    site: context.site,
    items,
  });
}
