/**
 * HTML Sanitization Utility
 * Provides functions to sanitize HTML content to prevent XSS attacks
 */

// List of allowed HTML tags for rich text content
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'div', 'span'
];

// List of allowed attributes for specific tags
const ALLOWED_ATTRIBUTES: { [key: string]: string[] } = {
  'a': ['href', 'title', 'target'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'div': ['class', 'id'],
  'span': ['class', 'id'],
  'p': ['class', 'id'],
  'h1': ['class', 'id'],
  'h2': ['class', 'id'],
  'h3': ['class', 'id'],
  'h4': ['class', 'id'],
  'h5': ['class', 'id'],
  'h6': ['class', 'id']
};

/**
 * Sanitizes HTML content by removing potentially dangerous elements and attributes
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: URLs that aren't images
  sanitized = sanitized.replace(/data:(?!image\/)/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object and embed tags
  sanitized = sanitized.replace(/<(object|embed)\b[^<]*(?:(?!<\/(object|embed)>)<[^<]*)*<\/(object|embed)>/gi, '');
  
  // Remove form tags
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  // Remove input tags
  sanitized = sanitized.replace(/<input\b[^<]*>/gi, '');
  
  // Remove potentially dangerous attributes
  sanitized = sanitized.replace(/\s*(on\w+|style|class|id)\s*=\s*["'][^"']*["']/gi, (match, attr) => {
    // Only allow specific attributes for specific tags
    const tagMatch = match.match(/<(\w+)/);
    if (tagMatch) {
      const tag = tagMatch[1].toLowerCase();
      if (ALLOWED_ATTRIBUTES[tag] && ALLOWED_ATTRIBUTES[tag].includes(attr.toLowerCase())) {
        return match;
      }
    }
    return '';
  });
  
  // Remove any remaining dangerous tags
  sanitized = sanitized.replace(/<(\/?)(?!\/?(?:p|br|strong|b|em|i|u|s|strike|h[1-6]|ul|ol|li|blockquote|pre|code|a|img|div|span)\b)[^>]*>/gi, '');
  
  return sanitized;
}

/**
 * Sanitizes text content by removing HTML tags and encoding special characters
 * @param text - The text string to sanitize
 * @returns Sanitized text string
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove all HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '');
  
  // Encode HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
}

/**
 * Validates and sanitizes user input for API calls
 * @param input - The input to validate
 * @param type - The type of input (email, password, text, html)
 * @returns Sanitized and validated input
 */
export function validateAndSanitizeInput(input: string, type: 'email' | 'password' | 'text' | 'html'): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  switch (type) {
    case 'email':
      // Basic email validation and sanitization
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        throw new Error('Invalid email format');
      }
      return input.toLowerCase().trim();
      
    case 'password':
      // Password validation
      if (input.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      return input;
      
    case 'text':
      // Sanitize text content
      return sanitizeText(input);
      
    case 'html':
      // Sanitize HTML content
      return sanitizeHTML(input);
      
    default:
      return sanitizeText(input);
  }
}
