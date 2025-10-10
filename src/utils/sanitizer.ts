/**
 * Sanitizes a string input by trimming whitespace and limiting its length.
 * This provides a basic defense against unusually long inputs.
 * @param input The string to sanitize.
 * @returns The sanitized string.
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().slice(0, 500);
};