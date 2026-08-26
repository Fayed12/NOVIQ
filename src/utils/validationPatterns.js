/**
 * Validation patterns and sanitization helpers for NOVIQ auth & forms.
 * Prevents XSS, script injection, and ensures strict data integrity.
 */

// Regex patterns
export const VALIDATION_PATTERNS = {
  // 2-60 chars, letters, spaces, hyphens, apostrophes (no script tags or brackets)
  fullName: /^[a-zA-Z\u0600-\u06FF\s.'-]{2,60}$/,
  
  // Standard compliant email format preventing common script injection chars
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Password requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
  password: {
    minLength: 8,
    hasUpper: /[A-Z]/,
    hasLower: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecial: /[^A-Za-z0-9\s]/,
  },
  
  // Disallowed dangerous script characters and sequences
  dangerousScript: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|data:text\/html|vbscript:|on\w+\s*=/i,
};

/**
 * Sanitizes string input by stripping dangerous tags, scripts, and null bytes.
 * @param {string} input 
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  const stripped = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, ''); // strip html tags

  // Filter out non-printable ASCII control characters (0-31 and 127) safely without regex control chars
  let clean = '';
  for (let i = 0; i < stripped.length; i += 1) {
    const code = stripped.charCodeAt(i);
    if ((code >= 32 && code !== 127) || code === 9 || code === 10 || code === 13) {
      clean += stripped[i];
    }
  }
  return clean.trim();
}

/**
 * Computes password strength on a scale of 0 to 4.
 * @param {string} password 
 * @returns {{ score: number, label: string, color: string, rules: { minLength: boolean, hasUpper: boolean, hasLower: boolean, hasNumber: boolean, hasSpecial: boolean } }}
 */
export function evaluatePasswordStrength(password = '') {
  const rules = {
    minLength: password.length >= 8,
    hasUpper: VALIDATION_PATTERNS.password.hasUpper.test(password),
    hasLower: VALIDATION_PATTERNS.password.hasLower.test(password),
    hasNumber: VALIDATION_PATTERNS.password.hasNumber.test(password),
    hasSpecial: VALIDATION_PATTERNS.password.hasSpecial.test(password),
  };

  let score = 0;
  if (rules.minLength) score += 1;
  if (rules.hasUpper && rules.hasLower) score += 1;
  if (rules.hasNumber) score += 1;
  if (rules.hasSpecial) score += 1;

  const strengthMap = [
    { label: 'Too Weak', color: 'var(--color-danger)' },   // 0
    { label: 'Weak', color: 'var(--color-danger)' },       // 1
    { label: 'Fair', color: 'var(--color-warning)' },       // 2
    { label: 'Strong', color: 'var(--color-info)' },       // 3
    { label: 'Very Strong', color: 'var(--color-success)' } // 4
  ];

  return {
    score,
    label: strengthMap[score].label,
    color: strengthMap[score].color,
    rules,
  };
}

/**
 * Masks an email for privacy (e.g., user@example.com -> u***r@example.com).
 * @param {string} email 
 * @returns {string}
 */
export function maskEmail(email = '') {
  if (!email || !email.includes('@')) return email;
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const first = localPart[0];
  const last = localPart[localPart.length - 1];
  return `${first}${'*'.repeat(Math.min(localPart.length - 2, 5))}${last}@${domain}`;
}
