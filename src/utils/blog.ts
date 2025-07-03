import { getCollection } from 'astro:content';
import { getReadingTimeFromMarkdown } from './reading-time';

export async function getBlogPostsWithReadingTime() {
  const posts = await getCollection('blog');

  return posts.map(post => {
    const readingTime = getReadingTimeFromMarkdown(post.body);
    return {
      ...post,
      readingTime: readingTime.text,
    };
  });
}

interface BlogPost {
  data: {
    pubDate: Date;
  };
}

export function sortPostsByDate<T extends BlogPost>(posts: T[]): T[] {
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
