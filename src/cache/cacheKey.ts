/**
 * Cache key construction for hybrid caching strategy.
 * - Exact match for freeform chat (normalized input)
 * - Template-based for [FEED]/[PLAY] command patterns
 */

export type InputType = 'chat' | 'feed' | 'play';

export interface DetectedInput {
  type: InputType;
  detail: string;  // normalized text, food name, or activity name
}

/** Normalize chat input: lowercase, strip trailing punctuation, collapse whitespace */
export function normalizeChatInput(text: string): string {
  return text
    .toLowerCase()
    .replace(/[!?.;,！？。，；、]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Detect input type from the raw input string sent to AI */
export function detectInputType(rawInput: string): DetectedInput {
  const feedMatch = rawInput.match(/^\[FEED\]\s+The user fed you:\s+(.+)$/i);
  if (feedMatch) {
    return { type: 'feed', detail: feedMatch[1].trim().toLowerCase() };
  }
  const playMatch = rawInput.match(/^\[PLAY\]\s+The user wants to play with you:\s+(.+)$/i);
  if (playMatch) {
    return { type: 'play', detail: playMatch[1].trim().toLowerCase() };
  }
  return { type: 'chat', detail: normalizeChatInput(rawInput) };
}

/** Build a cache key from input type, text, pet stage, and species */
export function buildCacheKey(
  type: InputType,
  inputText: string,
  stage: number,
  species: string,
): string {
  const speciesKey = species || 'egg';
  const normalized = type === 'chat' ? normalizeChatInput(inputText) : inputText.toLowerCase();
  // Include first 40 chars of normalized input for collision resistance
  const prefix = normalized.slice(0, 40);
  return `${type}:${prefix}|${stage}|${speciesKey}`;
}
