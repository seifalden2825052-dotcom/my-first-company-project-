/** Resolve a stored media path (e.g. /objects/uploads/uuid) to a servable URL. */
export function mediaUrl(content: string): string {
  if (content.startsWith("/objects/")) return `/api/storage${content}`;
  return content;
}
