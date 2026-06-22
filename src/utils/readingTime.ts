/**
 * Estimates reading time from markdown content.
 * Uses average reading speed of 200 words per minute.
 * Rounds up to the nearest minute, minimum 1 min.
 */
export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
