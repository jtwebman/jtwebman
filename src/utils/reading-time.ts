export function calculateReadingTime(content: string): {
  text: string;
  minutes: number;
  words: number;
} {
  // Remove HTML tags and extract text
  const text = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  // Count words
  const words = text.split(/\s+/).filter(word => word.length > 0).length;

  // Calculate reading time (average 200 words per minute)
  const minutes = Math.ceil(words / 200);

  // Format reading time text
  const text_display = minutes === 1 ? '1 min read' : `${minutes} min read`;

  return {
    text: text_display,
    minutes,
    words,
  };
}

export function getReadingTimeFromMarkdown(markdown: string): {
  text: string;
  minutes: number;
  words: number;
} {
  // Remove frontmatter
  const contentWithoutFrontmatter = markdown.replace(/^---\s*\n.*?\n---\s*\n/s, '');

  // Remove code blocks
  const contentWithoutCodeBlocks = contentWithoutFrontmatter.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  const contentWithoutInlineCode = contentWithoutCodeBlocks.replace(/`[^`]+`/g, '');

  // Remove markdown formatting
  const plainText = contentWithoutInlineCode
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/[-*+]\s+/g, '') // Remove list markers
    .replace(/\d+\.\s+/g, '') // Remove numbered list markers
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return calculateReadingTime(plainText);
}
