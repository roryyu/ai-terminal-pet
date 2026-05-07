/**
 * Evolution logic - determines when a pet evolves to the next stage.
 */

import type { PetState } from './petState.js';

export interface EvolutionStage {
  stage: number;
  name: string;
  requiredExp: number;
}

export const evolutionStages: EvolutionStage[] = [
  { stage: 1, name: 'Egg',       requiredExp: 0 },
  { stage: 2, name: 'Baby',      requiredExp: 100 },
  { stage: 3, name: 'Teen',      requiredExp: 300 },
  { stage: 4, name: 'Adult',     requiredExp: 600 },
  { stage: 5, name: 'Legendary', requiredExp: 1000 },
];

/** Mood threshold to hatch from egg */
export const HATCH_MOOD_THRESHOLD = 90;

/** Get the stage the pet should be at based on experience */
export function getStageForExp(exp: number): number {
  let stage = 1;
  for (const s of evolutionStages) {
    if (exp >= s.requiredExp) {
      stage = s.stage;
    }
  }
  return stage;
}

/** Check if pet should evolve, returns new stage or null if no evolution */
export function checkEvolution(state: PetState): number | null {
  // Egg stage: mood-based hatching - say warm words to make the egg happy!
  if (state.stage === 1 && state.mood >= HATCH_MOOD_THRESHOLD) {
    return 2; // hatch into Baby
  }

  // Other stages: exp-based evolution
  const newStage = getStageForExp(state.experience);
  if (newStage > state.stage) {
    return newStage;
  }
  return null;
}

/** Get evolution stage info */
export function getStageInfo(stage: number): EvolutionStage {
  return evolutionStages.find(s => s.stage === stage) ?? evolutionStages[0];
}

/** Get exp needed for next evolution */
export function expToNextStage(currentExp: number): { needed: number; current: number } {
  const currentStage = getStageForExp(currentExp);
  if (currentStage >= 5) {
    return { needed: 0, current: currentExp };
  }
  const nextStage = evolutionStages.find(s => s.stage === currentStage + 1);
  if (!nextStage) {
    return { needed: 0, current: currentExp };
  }
  return {
    needed: nextStage.requiredExp - currentExp,
    current: currentExp,
  };
}

/** Get evolution trigger description for current stage */
export function getEvolutionHint(stage: number): string {
  if (stage === 1) {
    return `Mood >= ${HATCH_MOOD_THRESHOLD} to hatch`;
  }
  const nextStage = evolutionStages.find(s => s.stage === stage + 1);
  return nextStage ? `EXP >= ${nextStage.requiredExp} to evolve` : 'Max stage';
}
