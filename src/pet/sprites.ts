/**
 * Pixel sprite data for all pet evolution stages.
 *
 * Design principles (from text-art.md pixel art skill):
 * - Each row must be equal width (null = transparent)
 * - Use color layers: body color + highlight + shadow + detail
 * - Build curves with gradually widening/narrowing rows
 * - Eyes: white highlight + black pupil for liveliness
 * - Blush: pink accents for cuteness
 */

import type { SpriteFrame } from '../utils/pixel.js';

const _ = null; // transparent

// ============================================================================
// Stage 1: Egg (12x14) - proper oval shape with highlight
// ============================================================================

export const eggFrames: SpriteFrame[] = [
  // Frame 0: idle - smooth oval egg
  [
    [_, _, _, _, _, 'white', 'white', _, _, _, _, _],
    [_, _, _, _, 'white', 'white', 'white', 'white', _, _, _, _],
    [_, _, _, 'white', 'white', 'white', 'white', 'white', 'white', _, _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, _, 'white', 'white', 'white', 'white', 'white', 'white', _, _, _],
    [_, _, _, _, 'white', 'white', 'white', 'white', _, _, _, _],
  ],
  // Frame 1: wobble left - slight tilt
  [
    [_, _, _, _, _, _, 'white', 'white', _, _, _, _],
    [_, _, _, _, _, 'white', 'white', 'white', 'white', _, _, _],
    [_, _, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, _, 'white', 'white', 'white', 'white', 'white', 'white', _, _, _],
    [_, _, _, _, 'white', 'white', 'white', 'white', _, _, _, _],
  ],
  // Frame 2: wobble right - slight tilt
  [
    [_, _, 'white', 'white', _, _, _, _, _, _, _, _],
    [_, _, 'white', 'white', 'white', 'white', _, _, _, _, _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _, _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, _, 'white', 'white', 'white', 'white', 'white', 'white', _, _, _],
    [_, _, _, _, 'white', 'white', 'white', 'white', _, _, _, _],
  ],
  // Frame 3: crack appearing
  [
    [_, _, _, _, _, 'white', 'white', _, _, _, _, _],
    [_, _, _, _, 'white', 'white', 'white', 'white', _, _, _, _],
    [_, _, _, 'white', 'white', 'white', 'white', 'white', 'white', _, _, _],
    [_, _, 'white', 'yellow', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, 'white', 'white', 'white', 'yellow', 'white', 'white', 'white', 'white', _, _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'yellow', 'yellow', 'yellow', 'yellow', 'white', 'white', 'white', _],
    [_, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', _, _],
    [_, _, _, 'white', 'white', 'white', 'white', 'white', 'white', _, _, _],
    [_, _, _, _, 'white', 'white', 'white', 'white', _, _, _, _],
  ],
];

// ============================================================================
// Stage 2: Baby (12x12) - round body, cute ears, big eyes
// ============================================================================

export const babyFrames: SpriteFrame[] = [
  // Frame 0: idle - round body with pointed ears
  [
    [_, _, 'green', _, _, _, _, _, _, 'green', _, _],
    [_, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'white', 'black', 'green', 'green', 'white', 'black', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'pink', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', _, _, _, _],
    [_, _, _, _, _, 'green', 'green', _, _, _, _, _],
  ],
  // Frame 1: blink - closed eyes
  [
    [_, _, 'green', _, _, _, _, _, _, 'green', _, _],
    [_, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'black', 'black', 'green', 'green', 'black', 'black', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'pink', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', _, _, _, _],
    [_, _, _, _, _, 'green', 'green', _, _, _, _, _],
  ],
  // Frame 2: happy - open mouth smile
  [
    [_, _, 'green', _, _, _, _, _, _, 'green', _, _],
    [_, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'white', 'black', 'green', 'green', 'white', 'black', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'red', 'red', 'red', 'red', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'pink', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', _, _, _, _],
    [_, _, _, _, _, 'green', 'green', _, _, _, _, _],
  ],
];

// ============================================================================
// Stage 3: Teen (14x14) - bigger round body, floppy ears, detailed face
// ============================================================================

export const teenFrames: SpriteFrame[] = [
  // Frame 0: idle
  [
    [_, 'green', 'green', _, _, _, _, _, _, _, _, 'green', 'green', _],
    [_, 'green', 'green', 'green', _, _, _, _, _, _, 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'white', 'black', 'green', 'green', 'white', 'black', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'pink', 'green', 'green', 'pink', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', _, _, _, _],
    [_, _, _, _, _, _, 'green', 'green', 'green', 'green', _, _, _, _],
  ],
  // Frame 1: blink
  [
    [_, 'green', 'green', _, _, _, _, _, _, _, _, 'green', 'green', _],
    [_, 'green', 'green', 'green', _, _, _, _, _, _, 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'black', 'black', 'green', 'green', 'black', 'black', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'pink', 'green', 'green', 'pink', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', _, _, _, _],
    [_, _, _, _, _, _, 'green', 'green', 'green', 'green', _, _, _, _],
  ],
  // Frame 2: happy
  [
    [_, 'green', 'green', _, _, _, _, _, _, _, _, 'green', 'green', _],
    [_, 'green', 'green', 'green', _, _, _, _, _, _, 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'white', 'black', 'green', 'green', 'white', 'black', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'red', 'red', 'red', 'red', 'red', 'red', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'pink', 'green', 'green', 'pink', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', _, _, _, _],
    [_, _, _, _, _, _, 'green', 'green', 'green', 'green', _, _, _, _],
  ],
];

// ============================================================================
// Stage 4: Adult (14x16) - full round body, arms, legs, expressive face
// ============================================================================

export const adultFrames: SpriteFrame[] = [
  // Frame 0: idle
  [
    [_, _, _, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', _, _, _, _, 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'white', 'black', 'green', 'green', 'green', 'white', 'black', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'green', 'green', 'pink', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'red', 'red', 'green', 'green', 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, _, _, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
  ],
  // Frame 1: blink
  [
    [_, _, _, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', _, _, _, _, 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'black', 'black', 'green', 'green', 'green', 'black', 'black', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'green', 'green', 'pink', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'red', 'red', 'green', 'green', 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, _, _, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
  ],
  // Frame 2: happy (jumping, arms up)
  [
    [_, _, _, 'green', 'green', _, _, _, _, _, 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', _, _, _, _, 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'white', 'black', 'green', 'green', 'green', 'white', 'black', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'green', 'green', 'pink', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, 'green', 'green', _, 'green', 'green', _, _, _, 'green', 'green', _, 'green', 'green', _],
    [_, 'green', 'green', _, 'green', 'green', _, _, _, 'green', 'green', _, 'green', 'green', _],
  ],
];

// ============================================================================
// Stage 5: Legendary (16x16) - majestic with golden crown and cyan wings
// ============================================================================

export const legendaryFrames: SpriteFrame[] = [
  // Frame 0: idle majestic
  [
    [_, _, _, _, _, 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', _, _, _, _, _],
    [_, _, _, _, 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', _, _, _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'white', 'black', 'green', 'green', 'green', 'white', 'black', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'green', 'green', 'pink', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'red', 'red', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, _, 'green', 'green', 'yellow', 'yellow', 'green', 'green', 'yellow', 'yellow', _, _, _],
    [_, _, _, _, _, 'green', 'green', 'yellow', 'yellow', 'green', 'green', 'yellow', 'yellow', _, _, _],
  ],
  // Frame 1: wings spread - cyan wings flanking body
  [
    [_, _, _, _, _, 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', _, _, _, _, _],
    [_, _, _, _, 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', _, _, _, _],
    ['cyan', 'cyan', _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, 'cyan', 'cyan'],
    ['cyan', 'cyan', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'cyan', 'cyan'],
    ['cyan', 'cyan', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'cyan', 'cyan'],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'white', 'black', 'green', 'green', 'green', 'white', 'black', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'pink', 'green', 'green', 'green', 'green', 'pink', 'green', 'green', 'green', 'green', 'green', _],
    [_, 'green', 'green', 'green', 'green', 'green', 'red', 'red', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _],
    [_, _, _, _, 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', _, _, _],
    [_, _, _, _, _, 'green', 'green', 'yellow', 'yellow', 'green', 'green', 'yellow', 'yellow', _, _, _],
    [_, _, _, _, _, 'green', 'green', 'yellow', 'yellow', 'green', 'green', 'yellow', 'yellow', _, _, _],
  ],
];

// ============================================================================
// Sprite lookup by evolution stage
// ============================================================================

export interface SpriteSet {
  frames: SpriteFrame[];
  fps: number; // animation speed
}

export const stageSprites: Record<number, SpriteSet> = {
  1: { frames: eggFrames, fps: 2 },
  2: { frames: babyFrames, fps: 3 },
  3: { frames: teenFrames, fps: 3 },
  4: { frames: adultFrames, fps: 3 },
  5: { frames: legendaryFrames, fps: 2 },
};

export const stageNames: Record<number, string> = {
  1: 'Egg',
  2: 'Baby',
  3: 'Teen',
  4: 'Adult',
  5: 'Legendary',
};
