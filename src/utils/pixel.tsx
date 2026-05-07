/**
 * Pixel rendering utilities
 *
 * Converts 2D color arrays into ink <Text> component trees.
 * Uses Unicode block characters for pixel-style rendering:
 *   █ = full block (1 cell = 1 pixel)
 *   ▀ = upper half block + ▄ = lower half block (2x vertical compression)
 */

import React from 'react';
import { Text } from 'ink';

/** Color name or hex string used in sprite data */
export type PixelColor = string | null; // null = transparent

/** A single frame of a sprite, row-major 2D color array */
export type SpriteFrame = PixelColor[][];

/**
 * Render a sprite frame as a SINGLE <Text> element using full-block pixels.
 * All rows are joined with \n inside one <Text> to avoid gaps between rows.
 * Consecutive same-color pixels are grouped into runs for efficiency.
 */
export function renderSpriteFull(frame: SpriteFrame): React.ReactNode {
  const allElements: React.ReactNode[] = [];

  frame.forEach((row, y) => {
    // Group consecutive same-color pixels into runs
    const runs: { color: string | null; count: number }[] = [];
    for (const color of row) {
      const lastRun = runs[runs.length - 1];
      if (lastRun && lastRun.color === color) {
        lastRun.count++;
      } else {
        runs.push({ color, count: 1 });
      }
    }

    runs.forEach((run, i) => {
      if (run.color === null) {
        allElements.push(<Text key={`${y}-${i}`}>{'  '.repeat(run.count)}</Text>);
      } else {
        allElements.push(<Text key={`${y}-${i}`} color={run.color}>{'██'.repeat(run.count)}</Text>);
      }
    });

    // Newline between rows (not after last row)
    if (y < frame.length - 1) {
      allElements.push('\n');
    }
  });

  // Wrap in a single <Text> so ink renders all rows as one continuous block
  return <Text>{allElements}</Text>;
}

/**
 * Render a sprite frame with 2x vertical compression.
 * Pairs of rows are combined into one text row:
 * - Both same color → █
 * - Both transparent → space
 * - Upper only → ▀ (upper half block)
 * - Lower only → ▄ (lower half block)
 * - Different colors → ▀ with upper as color, lower as backgroundColor
 */
export function renderSpriteCompressed(frame: SpriteFrame): React.ReactNode {
  const allElements: React.ReactNode[] = [];

  for (let y = 0; y < frame.length; y += 2) {
    const upperRow = frame[y];
    const lowerRow = y + 1 < frame.length ? frame[y + 1] : null;

    // Group consecutive cells with the same rendering into runs
    const runs: { upper: string | null; lower: string | null; count: number }[] = [];
    for (let x = 0; x < upperRow.length; x++) {
      const upper = upperRow[x];
      const lower = lowerRow ? lowerRow[x] : null;
      const lastRun = runs[runs.length - 1];
      if (lastRun && lastRun.upper === upper && lastRun.lower === lower) {
        lastRun.count++;
      } else {
        runs.push({ upper, lower, count: 1 });
      }
    }

    runs.forEach((run, i) => {
      const { upper, lower, count } = run;
      if (upper === null && lower === null) {
        allElements.push(<Text key={`${y}-${i}`}>{' '.repeat(count)}</Text>);
      } else if (upper !== null && lower === null) {
        allElements.push(<Text key={`${y}-${i}`} color={upper}>{'▀'.repeat(count)}</Text>);
      } else if (upper === null && lower !== null) {
        allElements.push(<Text key={`${y}-${i}`} color={lower}>{'▄'.repeat(count)}</Text>);
      } else if (upper === lower) {
        allElements.push(<Text key={`${y}-${i}`} color={upper!}>{'█'.repeat(count)}</Text>);
      } else {
        // Different colors: ▀ with foreground=upper, background=lower
        allElements.push(<Text key={`${y}-${i}`} color={upper!} backgroundColor={lower!}>{'▀'.repeat(count)}</Text>);
      }
    });

    // Newline between compressed rows
    if (y + 2 < frame.length) {
      allElements.push('\n');
    }
  }

  // Wrap in a single <Text> for continuous rendering
  return <Text>{allElements}</Text>;
}

/**
 * Color map for AI-generated pixel art.
 * Single character → terminal color name.
 */
export const PIXEL_COLOR_MAP: Record<string, string> = {
  '.': '',       // transparent (null)
  'W': 'white',
  'Y': 'yellow',
  'G': 'green',
  'R': 'red',
  'B': 'blue',
  'P': 'magenta',
  'K': 'black',
  'O': 'orange',
  'C': 'cyan',
  'D': 'gray',
  'N': 'gray',   // N for dim/gray
};

/** Reverse map: color name → character */
export const COLOR_TO_CHAR: Record<string, string> = {};
for (const [ch, color] of Object.entries(PIXEL_COLOR_MAP)) {
  if (color) COLOR_TO_CHAR[color] = ch;
}

/**
 * Parse ALL [SPRITE]...[/SPRITE] blocks from AI response into SpriteFrame[].
 * Multiple blocks = animation frames (played in order).
 * Single block = static sprite.
 * Returns empty array if no valid sprite block found.
 */
export function parseSpriteFromAI(response: string): SpriteFrame[] {
  const matches = [...response.matchAll(/\[SPRITE\]\s*\n([\s\S]*?)\n\s*\[\/SPRITE\]/g)];
  if (matches.length === 0) return [];

  const frames: SpriteFrame[] = [];

  for (const match of matches) {
    const grid = match[1]
      .split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.length > 0);

    if (grid.length === 0) continue;

    // Normalize row lengths to the max width
    const maxWidth = Math.max(...grid.map(r => r.length));

    const frame: SpriteFrame = grid.map(row => {
      const padded = row.padEnd(maxWidth, '.');
      return padded.split('').map(ch => {
        const color = PIXEL_COLOR_MAP[ch.toUpperCase()];
        return color || null; // unknown char → transparent
      });
    });

    frames.push(frame);
  }

  return frames;
}

/**
 * Strip [SPRITE]...[/SPRITE] blocks from AI response text.
 */
export function stripSpriteFromResponse(response: string): string {
  return response.replace(/\[SPRITE\]\s*\n[\s\S]*?\n\s*\[\/SPRITE\]/g, '').trim();
}

/**
 * Create a blank sprite frame of the given dimensions.
 */
export function blankFrame(width: number, height: number, fill: PixelColor = null): SpriteFrame {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => fill)
  );
}
