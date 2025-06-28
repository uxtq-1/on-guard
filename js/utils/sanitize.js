export function sanitizeInput(inputString) {
    if (typeof inputString !== 'string') return inputString;
    let sanitized = inputString;
    // Basic script tag removal
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, "");
    // Basic on-event attribute removal
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*(".*?"|'.*?'|[^>\s]+)/gi, "");
    // Basic javascript: href removal
    sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'\s]+/gi, "href=\"#\"");

    // PII Patterns (examples, can be expanded or made more precise)
    const PII_PATTERNS = [
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
        /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/g,
    ];
    PII_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED PII]');
    });
    if (inputString !== sanitized) {
        console.warn("WARN:sanitizeInput: Input modified for security/PII.");
    }
    return sanitized;
}
