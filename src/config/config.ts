/**
 * Configuration management.
 * Config file: ./ai-pet-data/config.json
 * State file:  ./ai-pet-data/state.json
 */

import fs from 'fs';
import path from 'path';
import type { PetState } from '../pet/petState.js';
import { createInitialState } from '../pet/petState.js';
import { getStageForExp } from '../pet/evolution.js';
import type { PetRegistry } from './registry.js';
import { getDefaultRegistry } from './registry.js';
import type { ChatMessage } from '../ai/provider.js';

const DATA_DIR = 'ai-pet-data';
const CONFIG_FILE = 'config.json';
const STATE_FILE = 'state.json';
const PETS_DIR = 'pets';
const REGISTRY_FILE = 'registry.json';

export interface AppConfig {
  provider: 'anthropic' | 'openai';
  apiKey: string;
  baseURL: string;  // custom API endpoint, empty = use default
  model: string;
  petName: string;
}

export function getDefaultConfig(): AppConfig {
  return {
    provider: 'anthropic',
    apiKey: '',
    baseURL: '',
    model: 'claude-sonnet-4-20250514',
    petName: 'Mochi',
  };
}

/** Ensure data directory exists */
function ensureDataDir(): string {
  const dir = path.resolve(process.cwd(), DATA_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** Load config from file, or return default if not found */
export function loadConfig(): AppConfig {
  const dir = ensureDataDir();
  const configPath = path.join(dir, CONFIG_FILE);
  if (!fs.existsSync(configPath)) {
    return getDefaultConfig();
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return { ...getDefaultConfig(), ...JSON.parse(raw) };
  } catch {
    return getDefaultConfig();
  }
}

/** Save config to file */
export function saveConfig(config: AppConfig): void {
  const dir = ensureDataDir();
  const configPath = path.join(dir, CONFIG_FILE);
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

/** Load pet state from file, or return initial state */
export function loadState(config: AppConfig): PetState {
  const dir = ensureDataDir();
  const statePath = path.join(dir, STATE_FILE);
  if (!fs.existsSync(statePath)) {
    return createInitialState(config.petName);
  }
  try {
    const raw = fs.readFileSync(statePath, 'utf-8');
    const saved = JSON.parse(raw) as PetState;
    // Recalculate stage from experience
    saved.stage = getStageForExp(saved.experience);
    saved.name = config.petName || saved.name;
    return saved;
  } catch {
    return createInitialState(config.petName);
  }
}

/** Save pet state to file */
export function saveState(state: PetState): void {
  const dir = ensureDataDir();
  const statePath = path.join(dir, STATE_FILE);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}

/** Check if config has been set up (has API key) */
export function isConfigured(config: AppConfig): boolean {
  return config.apiKey.length > 0;
}

/** Ensure pets directory exists and return its path */
export function ensurePetsDir(): string {
  const dir = path.join(ensureDataDir(), PETS_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/** Load pet registry from file */
export function loadRegistry(): PetRegistry {
  const dir = ensurePetsDir();
  const registryPath = path.join(dir, REGISTRY_FILE);
  if (!fs.existsSync(registryPath)) {
    return getDefaultRegistry();
  }
  try {
    const raw = fs.readFileSync(registryPath, 'utf-8');
    return { ...getDefaultRegistry(), ...JSON.parse(raw) };
  } catch {
    return getDefaultRegistry();
  }
}

/** Save pet registry to file */
export function saveRegistry(registry: PetRegistry): void {
  const dir = ensurePetsDir();
  const registryPath = path.join(dir, REGISTRY_FILE);
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf-8');
}

/** Load a specific pet's state */
export function loadPetState(petId: string): PetState | null {
  const dir = ensurePetsDir();
  const statePath = path.join(dir, `${petId}.json`);
  if (!fs.existsSync(statePath)) return null;
  try {
    const raw = fs.readFileSync(statePath, 'utf-8');
    const saved = JSON.parse(raw) as PetState;
    saved.stage = getStageForExp(saved.experience);
    return saved;
  } catch {
    return null;
  }
}

/** Save a specific pet's state */
export function savePetState(petId: string, state: PetState): void {
  const dir = ensurePetsDir();
  const statePath = path.join(dir, `${petId}.json`);
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}

/** Load a specific pet's chat history */
export function loadPetHistory(petId: string): ChatMessage[] {
  const dir = ensurePetsDir();
  const historyPath = path.join(dir, `${petId}-history.json`);
  if (!fs.existsSync(historyPath)) return [];
  try {
    const raw = fs.readFileSync(historyPath, 'utf-8');
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

/** Save a specific pet's chat history */
export function savePetHistory(petId: string, messages: ChatMessage[]): void {
  const dir = ensurePetsDir();
  const historyPath = path.join(dir, `${petId}-history.json`);
  fs.writeFileSync(historyPath, JSON.stringify(messages, null, 2), 'utf-8');
}

/** Delete a pet's state and history files */
export function deletePetData(petId: string): void {
  const dir = ensurePetsDir();
  const statePath = path.join(dir, `${petId}.json`);
  const historyPath = path.join(dir, `${petId}-history.json`);
  if (fs.existsSync(statePath)) fs.unlinkSync(statePath);
  if (fs.existsSync(historyPath)) fs.unlinkSync(historyPath);
}
