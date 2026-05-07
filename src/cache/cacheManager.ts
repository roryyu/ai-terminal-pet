/**
 * Cache manager for LLM response caching.
 * Persisted to ./ai-pet-data/cache.json
 * Features: TTL expiry, max entry cap, LRU eviction, stage-based invalidation.
 */

import fs from 'fs';
import path from 'path';
import type { CacheEntry, CacheData } from './cacheTypes.js';

const DATA_DIR = 'ai-pet-data';
const CACHE_FILE = 'cache.json';

export class CacheManager {
  private data: CacheData;
  private dirty: boolean = false;
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor(ttlMs: number = 3600000, maxEntries: number = 200) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.data = { entries: {}, version: 1 };
  }

  /** Get a cached response by key. Returns null if not found or expired. */
  get(key: string): CacheEntry | null {
    const entry = this.data.entries[key];
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.createdAt > this.ttlMs) {
      delete this.data.entries[key];
      this.dirty = true;
      return null;
    }

    // Increment hit count
    entry.hitCount++;
    this.dirty = true;
    return entry;
  }

  /** Store a raw AI response in the cache. Does not cache empty responses. */
  set(key: string, rawResponse: string): void {
    if (!rawResponse.trim()) return; // Don't cache empty/error responses

    this.data.entries[key] = {
      key,
      rawResponse,
      createdAt: Date.now(),
      hitCount: 0,
    };
    this.dirty = true;
    this.evictIfFull();
  }

  /** Remove all cache entries for a specific pet stage (called on evolution) */
  invalidateStage(stage: number): void {
    const stageSuffix = `|${stage}|`;
    for (const key of Object.keys(this.data.entries)) {
      if (key.includes(stageSuffix)) {
        delete this.data.entries[key];
        this.dirty = true;
      }
    }
  }

  /** Remove expired entries */
  evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of Object.entries(this.data.entries)) {
      if (now - entry.createdAt > this.ttlMs) {
        delete this.data.entries[key];
        this.dirty = true;
      }
    }
  }

  /** Evict entries if over max capacity. Removes lowest hitCount, oldest first. */
  private evictIfFull(): void {
    const entries = Object.entries(this.data.entries);
    if (entries.length <= this.maxEntries) return;

    // Sort by hitCount ascending, then createdAt ascending
    entries.sort((a, b) => {
      if (a[1].hitCount !== b[1].hitCount) return a[1].hitCount - b[1].hitCount;
      return a[1].createdAt - b[1].createdAt;
    });

    const toRemove = entries.length - this.maxEntries;
    for (let i = 0; i < toRemove; i++) {
      delete this.data.entries[entries[i][0]];
    }
    this.dirty = true;
  }

  /** Load cache from disk */
  load(): void {
    const dir = path.resolve(process.cwd(), DATA_DIR);
    const cachePath = path.join(dir, CACHE_FILE);
    if (!fs.existsSync(cachePath)) return;
    try {
      const raw = fs.readFileSync(cachePath, 'utf-8');
      const parsed = JSON.parse(raw) as CacheData;
      if (parsed.entries && typeof parsed.entries === 'object') {
        this.data = parsed;
      }
    } catch {
      // Corrupted cache file - start fresh
      this.data = { entries: {}, version: 1 };
    }
    this.evictExpired();
    this.dirty = false;
  }

  /** Save cache to disk only if dirty */
  save(): void {
    if (!this.dirty) return;
    const dir = path.resolve(process.cwd(), DATA_DIR);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const cachePath = path.join(dir, CACHE_FILE);
    fs.writeFileSync(cachePath, JSON.stringify(this.data, null, 2), 'utf-8');
    this.dirty = false;
  }

  /** Get cache statistics */
  getStats(): { totalEntries: number; totalHits: number; oldestAgeMs: number } {
    const entries = Object.values(this.data.entries);
    const totalHits = entries.reduce((sum, e) => sum + e.hitCount, 0);
    const oldestMs = entries.length > 0
      ? Date.now() - Math.min(...entries.map(e => e.createdAt))
      : 0;
    return {
      totalEntries: entries.length,
      totalHits,
      oldestAgeMs: oldestMs,
    };
  }
}
