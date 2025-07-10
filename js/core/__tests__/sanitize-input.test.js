import { sanitizeInput } from '../sanitize-input';

describe('sanitizeInput', () => {
  test('should remove script tags', () => {
    const input = '<script>alert("xss")</script>Some text';
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe('Some text');
    expect(flagged).toBe(false); // Removing script tags itself doesn't set flagged to true
  });

  test('should remove inline on-event attributes', () => {
    const input = '<button onclick="doSomething()">Click Me</button>';
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe('<button>Click Me</button>');
    expect(flagged).toBe(false);
  });

  test('should replace javascript: hrefs', () => {
    const input = '<a href="javascript:alert(\'xss\')">Click Me</a>';
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe('<a href="#">Click Me</a>');
    expect(flagged).toBe(false);
  });

  test('should redact SSN patterns and set flagged to true', () => {
    const input = 'My SSN is 123-45-6789.';
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe('My SSN is [REDACTED PII].');
    expect(flagged).toBe(true);
  });

  test('should redact credit card patterns and set flagged to true', () => {
    const input = 'Card: 4111222233334444';
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe('Card: [REDACTED PII]');
    expect(flagged).toBe(true);
  });

  test('should flag suspicious keywords and set flagged to true', () => {
    const input = 'My password is very secret';
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe('My password is very secret'); // Sanitized output is the same
    expect(flagged).toBe(true); // But it should be flagged
  });

  test('should handle input that is not a string', () => {
    const input = 12345;
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe(12345);
    expect(flagged).toBe(false);
  });

  test('should return original string if no sanitization or flagging needed', () => {
    const input = 'This is a safe string.';
    const { sanitized, flagged } = sanitizeInput(input);
    expect(sanitized).toBe('This is a safe string.');
    expect(flagged).toBe(false);
  });

  test('should remove multiple script tags', () => {
    const input = '<script>one</script>middle<script>two</script>';
    const {sanitized} = sanitizeInput(input);
    expect(sanitized).toBe('middle');
  });

  test('should remove script tags with attributes', () => {
    const input = '<script type="text/javascript">evil()</script>pure';
    const {sanitized} = sanitizeInput(input);
    expect(sanitized).toBe('pure');
  });
});
