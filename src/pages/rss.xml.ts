import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'JT Turner - Blog',
    description: 'Thoughts on programming, digital marketing, and building software',
    site: context.site!,
    items: sortedPosts.map(post => ({
      ...post.data,
      link: `/blog/${post.slug}/`,
      pubDate: post.data.pubDate,
    })),
  });
}
