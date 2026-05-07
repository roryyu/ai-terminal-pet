/**
 * Cache type definitions for LLM response caching.
 */

export interface CacheEntry {
  key: string;
  rawResponse: string;
  createdAt: number;   // Unix timestamp ms
  hitCount: number;    // Track cache usefulness
}

export interface CacheData {
  entries: Record<string, CacheEntry>;
  version: number;
}
