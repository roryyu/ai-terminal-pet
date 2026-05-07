/**
 * Pet registry - tracks all pets and the active pet.
 * Stored at ./ai-pet-data/pets/registry.json
 */

import type { PetId } from '../pet/petState.js';

export interface PetRegistry {
  pets: PetId[];
  activePetId: string;
  version: number;
}

export function getDefaultRegistry(): PetRegistry {
  return {
    pets: [],
    activePetId: '',
    version: 1,
  };
}
