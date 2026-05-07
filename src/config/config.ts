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

const DATA_DIR = 'ai-pet-data';
const CONFIG_FILE = 'config.json';
const STATE_FILE = 'state.json';

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
