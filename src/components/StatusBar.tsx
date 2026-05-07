/**
 * StatusBar component - displays pet mood, hunger, and experience bars.
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { PetState } from '../pet/petState.js';
import { getMoodLabel, getHungerLabel } from '../pet/petState.js';
import { expToNextStage, getStageInfo, HATCH_MOOD_THRESHOLD, getEvolutionHint } from '../pet/evolution.js';

interface StatusBarProps {
  state: PetState;
}

function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const width = 10;
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  const bar = '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, empty));

  return (
    <Box>
      <Text bold color={color}>{label.padEnd(4)}</Text>
      <Text color={color}>{bar.padEnd(11)}</Text>
      <Text dimColor>{Math.round(value)}/{max}</Text>
    </Box>
  );
}

const StatusBar: React.FC<StatusBarProps> = ({ state }) => {
  const moodLabel = getMoodLabel(state.mood);
  const hungerLabel = getHungerLabel(state.hunger);
  const stageInfo = getStageInfo(state.stage);

  return (
    <Box flexDirection="column">
      <ProgressBar value={state.mood} max={100} color="green" label={moodLabel} />
      {state.stage === 1 ? (
        // Egg stage: show hatch progress instead of hunger/EXP
        <ProgressBar value={state.mood} max={HATCH_MOOD_THRESHOLD} color="yellow" label="Hatch" />
      ) : (
        <>
          <ProgressBar value={state.hunger} max={100} color="red" label={hungerLabel} />
          {stageInfo.stage < 5 ? (
            <ProgressBar value={state.experience} max={expToNextStage(state.experience).needed + state.experience} color="cyan" label="EXP" />
          ) : (
            <Text color="yellow" bold>EXP: {state.experience} (MAX)</Text>
          )}
        </>
      )}
      <Text dimColor>{getEvolutionHint(state.stage)}</Text>
    </Box>
  );
};

export default StatusBar;
