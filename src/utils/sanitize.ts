/**
 * Sanitize a string to be used as a filename/folder name
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Replace special characters with dashes
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
    // Replace spaces and underscores with dashes
    .replace(/[\s_]+/g, '-')
    // Remove consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Limit length
    .slice(0, 100)
    // Fallback if empty
    || 'unnamed'
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'unnamed'
}
