/**
 * Simple link detection and extraction utilities
 */

// URL regex pattern - matches http, https, www, and common domains
// Simple and reliable: matches https:// or http:// followed by any non-whitespace characters
// Also matches www. and domain patterns
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}[^\s]*)/gi;

export interface LinkMatch {
  url: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Detects all URLs in a text string
 * @param text - The text to search for links
 * @returns Array of link matches with their positions
 */
export function detectLinks(text: string): LinkMatch[] {
  const matches: LinkMatch[] = [];
  let match;

  // Reset regex lastIndex
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text)) !== null) {
    let url = match[0];
    
    // Skip if empty
    if (!url) continue;
    
    // Add protocol if missing (for www. or domain-only patterns)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    matches.push({
      url,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return matches;
}

/**
 * Checks if a text contains any links
 * @param text - The text to check
 * @returns True if text contains at least one link
 */
export function hasLinks(text: string): boolean {
  URL_REGEX.lastIndex = 0;
  return URL_REGEX.test(text);
}

/**
 * Formats a URL for display (removes protocol, truncates if needed)
 * @param url - The URL to format
 * @param maxLength - Maximum length for display (default: 50)
 * @returns Formatted URL string
 */
export function formatUrlForDisplay(url: string, maxLength: number = 50): string {
  // Remove protocol
  let display = url.replace(/^https?:\/\//, '');
  
  // Remove trailing slash
  display = display.replace(/\/$/, '');
  
  // Truncate if too long
  if (display.length > maxLength) {
    display = display.substring(0, maxLength - 3) + '...';
  }
  
  return display;
}
