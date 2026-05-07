/**
 * PetSprite component - renders animated pixel pet.
 * Priority: AI dynamic sprite > recolored default sprite.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'ink';
import { stageSprites, stageNames } from '../pet/sprites.js';
import { renderSpriteFull, parseSpriteFromAI } from '../utils/pixel.js';
import type { PetState } from '../pet/petState.js';
import { getSpeciesColor } from '../pet/petState.js';
import type { SpriteFrame, PixelColor } from '../utils/pixel.js';

interface PetSpriteProps {
  state: PetState;
}

/** Recolor a sprite frame: replace 'green' with species color */
function recolorFrame(frame: SpriteFrame, newColor: string): SpriteFrame {
  if (newColor === 'green') return frame; // default, no change needed
  return frame.map(row =>
    row.map(pixel => pixel === 'green' ? newColor : pixel)
  );
}

const PetSprite: React.FC<PetSpriteProps> = ({ state }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const spriteSet = stageSprites[state.stage] ?? stageSprites[1];
  const stageName = stageNames[state.stage] ?? 'Unknown';
  const speciesColor = state.species ? getSpeciesColor(state.species) : 'green';
  const speciesLabel = state.species ? ` (${state.species})` : (state.wish ? ` (wish: ${state.wish})` : '');

  // Parse AI dynamic sprite frames
  const aiFrames = useMemo(() =>
    state.dynamicSprite ? parseSpriteFromAI(state.dynamicSprite) : [],
    [state.dynamicSprite]
  );

  // Animation timer: works for both default and AI sprites
  useEffect(() => {
    const totalFrames = aiFrames.length > 0 ? aiFrames.length : spriteSet.frames.length;
    if (totalFrames <= 1) return;

    const fps = aiFrames.length > 0 ? 2 : spriteSet.fps;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % totalFrames);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [aiFrames.length, spriteSet]);

  // Determine current frame
  const currentFrame = useMemo(() => {
    // AI dynamic sprite has priority
    if (aiFrames.length > 0) {
      return aiFrames[frameIndex % aiFrames.length];
    }
    // Fallback: recolored default sprite
    const rawFrame = spriteSet.frames[frameIndex % spriteSet.frames.length];
    if (state.stage > 1 && state.species) {
      return recolorFrame(rawFrame, speciesColor);
    }
    return rawFrame;
  }, [aiFrames, frameIndex, spriteSet, state.stage, state.species, speciesColor]);

  return (
    <Box flexDirection="column" alignItems="center">
      {renderSpriteFull(currentFrame)}
      <Text bold color="yellow">{state.name}</Text>
      <Text dimColor>Stage {state.stage}: {stageName}{speciesLabel}</Text>
    </Box>
  );
};

export default PetSprite;
