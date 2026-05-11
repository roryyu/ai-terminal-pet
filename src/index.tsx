/**
 * AI Terminal Pet - Entry point
 *
 * Boots the terminal pet application with config and AI provider.
 * Supports multi-pet with automatic migration from legacy single-pet state.
 */

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { loadConfig, saveConfig, loadState, isConfigured, loadRegistry, saveRegistry, loadPetState, savePetState, loadPetHistory, loadPetInventory, ensurePetsDir, type AppConfig } from './config/config.js';
import { AnthropicProvider } from './ai/anthropic.js';
import { OpenAIProvider } from './ai/openai.js';
import type { AIProvider, ChatMessage } from './ai/provider.js';
import { startApp } from './app.js';
import { createInitialState, generatePetId, type PetId } from './pet/petState.js';
import type { PetState } from './pet/petState.js';
import type { PetInventory } from './shop/inventory.js';
import type { PetRegistry } from './config/registry.js';
import { getDefaultRegistry } from './config/registry.js';

const DATA_DIR = 'ai-pet-data';

const program = new Command();

program
  .name('ai-pet')
  .description('A terminal virtual pet with AI chat and pixel art evolution')
  .version('0.1.0')
  .option('-n, --name <name>', 'Pet name')
  .option('-p, --provider <provider>', 'AI provider (anthropic|openai)')
  .option('-k, --api-key <key>', 'API key for AI provider')
  .option('-m, --model <model>', 'AI model name')
  .option('-u, --base-url <url>', 'Custom API base URL')
  .action(async (opts) => {
    try {
      await main(opts);
    } catch (err) {
      console.error('Fatal error:', err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

function createProvider(config: AppConfig): AIProvider {
  const baseURL = config.baseURL || undefined;
  if (config.provider === 'openai') {
    return new OpenAIProvider(config.apiKey, config.model, baseURL);
  }
  return new AnthropicProvider(config.apiKey, config.model, baseURL);
}

async function main(opts: Record<string, string | undefined>) {
  // Load or create config
  let config = loadConfig();

  // Apply CLI overrides
  if (opts.name) config.petName = opts.name;
  if (opts.provider) config.provider = opts.provider as AppConfig['provider'];
  if (opts.apiKey) config.apiKey = opts.apiKey;
  if (opts.model) config.model = opts.model;
  if (opts.baseUrl) config.baseURL = opts.baseUrl;

  // First-time setup if no API key
  if (!isConfigured(config)) {
    console.log('');
    console.log('  Welcome to AI Terminal Pet!');
    console.log('  First-time setup required.');
    console.log('');
    console.log('  Please set your API key:');
    console.log('    ai-pet --api-key YOUR_KEY');
    console.log('    ai-pet --api-key YOUR_KEY --provider openai');
    console.log('');
    console.log('  Or create ./ai-pet-data/config.json manually:');
    console.log('    { "provider": "anthropic", "apiKey": "...", "baseURL": "", "model": "claude-sonnet-4-20250514", "petName": "Mochi" }');
    console.log('');
    process.exit(0);
  }

  // Save config if it was modified
  saveConfig(config);

  // Load registry and all pet states
  let registry = loadRegistry();
  const initialPets: Record<string, PetState> = {};
  const initialHistories: Record<string, ChatMessage[]> = {};
  const initialInventories: Record<string, PetInventory> = {};

  if (registry.pets.length === 0) {
    // Check for legacy single-pet state.json to migrate
    const petsDir = path.resolve(process.cwd(), DATA_DIR, 'pets');
    const legacyStatePath = path.resolve(process.cwd(), DATA_DIR, 'state.json');

    if (!fs.existsSync(petsDir) && fs.existsSync(legacyStatePath)) {
      // Migrate legacy state to multi-pet format
      const legacyState = loadState(config);
      const petId = generatePetId(legacyState.name);
      initialPets[petId] = legacyState;
      initialHistories[petId] = [];
      initialInventories[petId] = loadPetInventory(petId);
      const petEntry: PetId = { id: petId, name: legacyState.name };
      registry = { pets: [petEntry], activePetId: petId, version: 1 };
      ensurePetsDir();
      savePetState(petId, legacyState);
      saveRegistry(registry);
      // Don't delete legacy state.json - safe migration
    } else {
      // Fresh start: create default pet
      const petId = generatePetId(config.petName);
      const state = createInitialState(config.petName);
      initialPets[petId] = state;
      initialHistories[petId] = [];
      initialInventories[petId] = loadPetInventory(petId);
      const petEntry: PetId = { id: petId, name: config.petName };
      registry = { pets: [petEntry], activePetId: petId, version: 1 };
      ensurePetsDir();
      savePetState(petId, state);
      saveRegistry(registry);
    }
  } else {
    // Load existing multi-pet data
    const validPetIds: string[] = [];
    for (const petIdObj of registry.pets) {
      const state = loadPetState(petIdObj.id);
      if (state) {
        initialPets[petIdObj.id] = state;
        initialHistories[petIdObj.id] = loadPetHistory(petIdObj.id);
        initialInventories[petIdObj.id] = loadPetInventory(petIdObj.id);
        validPetIds.push(petIdObj.id);
      }
    }

    // Remove corrupted pets from registry
    if (validPetIds.length < registry.pets.length) {
      registry.pets = registry.pets.filter(p => validPetIds.includes(p.id));
      saveRegistry(registry);
    }

    // Validate activePetId still exists
    if (!initialPets[registry.activePetId] && registry.pets.length > 0) {
      registry.activePetId = registry.pets[0].id;
      saveRegistry(registry);
    }
  }

  // If no valid pets exist, create a default one
  if (Object.keys(initialPets).length === 0) {
    const petId = generatePetId(config.petName);
    const state = createInitialState(config.petName);
    initialPets[petId] = state;
    initialHistories[petId] = [];
    initialInventories[petId] = loadPetInventory(petId);
    const petEntry: PetId = { id: petId, name: config.petName };
    registry = { pets: [petEntry], activePetId: petId, version: 1 };
    ensurePetsDir();
    savePetState(petId, state);
    saveRegistry(registry);
  }

  // Create AI provider
  const provider = createProvider(config);

  // Start the app
  await startApp(initialPets, initialHistories, initialInventories, registry.activePetId, registry, provider);
}

program.parse();
