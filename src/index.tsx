/**
 * AI Terminal Pet - Entry point
 *
 * Boots the terminal pet application with config and AI provider.
 */

import { Command } from 'commander';
import { loadConfig, saveConfig, loadState, isConfigured, type AppConfig } from './config/config.js';
import { AnthropicProvider } from './ai/anthropic.js';
import { OpenAIProvider } from './ai/openai.js';
import type { AIProvider } from './ai/provider.js';
import { startApp } from './app.js';
import { createInitialState } from './pet/petState.js';

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

  // Load or create pet state
  const state = loadState(config);

  // Create AI provider
  const provider = createProvider(config);

  // Start the app
  await startApp(state, provider);
}

program.parse();
