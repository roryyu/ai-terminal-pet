/**
 * EvolutionAnimation component - shown when pet evolves.
 */

import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { stageNames } from '../pet/sprites.js';
import type { PetState } from '../pet/petState.js';

interface EvolutionAnimationProps {
  oldStage: number;
  newStage: number;
  petName: string;
  onComplete: () => void;
}

const sparkles = ['✦', '✧', '⋆', '★', '☆', '✨'];

const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({ oldStage, newStage, petName, onComplete }) => {
  const [tick, setTick] = useState(0);
  const oldName = stageNames[oldStage] ?? 'Unknown';
  const newName = stageNames[newStage] ?? 'Unknown';

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 300);

    const timeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const sparkleLine = Array.from({ length: 20 }, (_, i) => {
    const idx = (i + tick) % sparkles.length;
    return sparkles[idx];
  }).join('');

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text color="yellow">{sparkleLine}</Text>
      <Box marginY={1}>
        <Text bold color="yellow">EVOLUTION!</Text>
      </Box>
      <Text>
        <Text color="gray">{oldName}</Text>
        <Text color="yellow"> → </Text>
        <Text bold color="green">{newName}</Text>
      </Text>
      <Text bold color="cyan">{petName} is evolving!</Text>
      <Text color="yellow">{sparkleLine}</Text>
      {tick > 2 && (
        <Box marginY={1}>
          <Text dimColor>Stage {oldStage} → Stage {newStage}</Text>
        </Box>
      )}
    </Box>
  );
};

export default EvolutionAnimation;
