/**
 * PetTabs component - displays all pets as switchable tabs.
 * Active pet is highlighted, inactive pets are dimmed.
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { PetId } from '../pet/petState.js';

interface PetTabsProps {
  pets: PetId[];
  activePetId: string;
}

const PetTabs: React.FC<PetTabsProps> = ({ pets, activePetId }) => {
  if (pets.length <= 1) return null;

  return (
    <Box paddingX={1}>
      {pets.map((pet, index) => {
        const isActive = pet.id === activePetId;
        return (
          <Box key={pet.id} marginRight={1}>
            <Text>
              {isActive ? (
                <Text bold color="cyan">[{pet.name}]</Text>
              ) : (
                <Text dimColor>{pet.name}</Text>
              )}
            </Text>
          </Box>
        );
      })}
      <Text dimColor> Tab=switch</Text>
    </Box>
  );
};

export default PetTabs;
