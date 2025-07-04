// js/utils/sanitize.js

/**
 * sanitizeInput - Cleans input for security & PII leakage prevention.
 * Applies anti-XSS, neutralizes inline JS, and masks sensitive PII patterns.
 *
 * @param {string} inputString - Raw user input
 * @returns {string} sanitized - Cleaned version of input
 */
export function sanitizeInput(inputString) {
  if (typeof inputString !== 'string') return inputString;

  let sanitized = inputString;

  // 🚫 Remove <script> tags
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, "");

  // 🚫 Remove on* event attributes (e.g., onclick, onload)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(".*?"|'.*?'|[^>\s]+)/gi, "");

  // 🚫 Remove javascript: from href attributes
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'\s]+/gi, 'href="#"');

  // 🔐 Mask Personally Identifiable Information (PII)
  const PII_PATTERNS = [
    // US Social Security Number
    /\b\d{3}-\d{2}-\d{4}\b/g,

    // Credit Card patterns (Visa, MasterCard, Amex, Discover, JCB, Diners Club)
    /\b(?:4[0-9]{12}(?:[0-9]{3})?        # Visa
       |5[1-5][0-9]{14}                  # MasterCard
       |3[47][0-9]{13}                   # American Express
       |3(?:0[0-5]|[68][0-9])[0-9]{11}   # Diners Club
       |6(?:011|5[0-9]{2})[0-9]{12}      # Discover
       |(?:2131|1800|35\d{3})\d{11}      # JCB
    )\b/gsx,
  ];

  PII_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED PII]');
  });

  if (inputString !== sanitized) {
    console.warn("sanitizeInput: Input was modified for security/PII compliance.");
  }

  return sanitized;
}
