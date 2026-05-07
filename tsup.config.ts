import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: ['ink', 'react', '@anthropic-ai/sdk', 'openai', 'commander'],
});
