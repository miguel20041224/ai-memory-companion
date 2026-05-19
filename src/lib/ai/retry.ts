import { isGeminiRateLimitError, isGeminiUnavailableError } from "./gemini-errors";

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown): boolean {
  return isGeminiRateLimitError(error) || isGeminiUnavailableError(error);
}

/** Reintenta solo en 429 / sobrecarga, con backoff exponencial. */
export async function withGeminiRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1500;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      const jitter = Math.floor(Math.random() * 400);
      await delay(baseDelayMs * 2 ** attempt + jitter);
    }
  }

  throw lastError;
}
