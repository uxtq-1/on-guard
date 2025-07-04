// js/utils/sanitize.js
export function sanitizeInput(inputString) {
  if (typeof inputString !== 'string') {
    return { sanitized: inputString, flagged: false };
  }

  let flagged = false;
  let sanitized = inputString;

  // 🚫 Remove <script> tags
  sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // 🚫 Remove inline on-event attributes (e.g., onclick, onmouseover)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(".*?"|'.*?'|[^>\s]+)/gi, '');

  // 🚫 Remove javascript: hrefs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'\s]+/gi, 'href="#"');

  // 🕵️ Redact known PII patterns (Social Security Numbers, credit card numbers, etc.)
  const PII_PATTERNS = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // US SSN
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/g // Credit Cards
  ];

  PII_PATTERNS.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      sanitized = sanitized.replace(pattern, '[REDACTED PII]');
      flagged = true;
      console.warn('🔒 sanitizeInput: PII pattern redacted.');
    }
  });

  // 🛡️ Anomaly detection: look for sensitive words like password, token, pin, etc.
  const suspiciousKeywords = [
    'password',
    'token',
    'pin',
    'secret',
    'apikey',
    'auth',
    'privatekey',
    'credential',
    'key',
    'passcode',
    'accesscode',
    'verification'
  ];
  const keywordPattern = new RegExp(`\\b(${suspiciousKeywords.join('|')})\\b`, 'i');
  if (keywordPattern.test(inputString)) {
    flagged = true;
    console.warn('🛡️ Anomaly Detected: Suspicious keyword found in user input.');
  }

  return {
    sanitized,
    flagged
  };
}
