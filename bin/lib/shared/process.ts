/**
 * Process and error handling utilities
 */

/**
 * Log error message to stderr and exit process with failure code
 * @param msg - Error message to display
 * @returns Never returns (process exits)
 */
export const die = (msg: string): never => (
  console.error(`Error: ${msg}`),
  process.exit(1)
);
