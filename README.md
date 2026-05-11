# AI Terminal Pet 🐣

A terminal-based virtual pet with AI chat, pixel art evolution, and personality customization. Built with Node.js, Ink, and React.

![Node.js](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **AI-Powered Pet** — Chat with your pet powered by LLM (Anthropic/OpenAI). Your pet responds with personality and emotion
- **Pixel Art Evolution** — Watch your pet evolve through 5 stages: Egg → Baby → Teen → Adult → Legendary, with animated pixel sprites
- **AI-Drawn Sprites** — The AI model controls your pet's appearance! It can draw pixel art and even animate with multiple frames
- **Mood-Driven Hatching** — The egg hatches when you warm it with kind words (mood ≥ 90), not by grinding EXP
- **Wish System** — Make a wish during the egg stage (`/wish dragon`) to decide what your pet becomes
- **Soul/Personality** — Define your pet's personality with `/soul` (e.g., 傲娇, lazy and greedy, 勇敢善良)
- **Food & Play Reactions** — Feed specific foods (`/feed 鱼干`) or play activities (`/play 追球`) and your pet reacts in character
- **Crypto Pet Food Shop** — Buy premium food items with USDT/USDC via [OKX Agentic Wallet](https://github.com/okx/onchainos-skills). Rare and legendary foods give bigger stat boosts and bonus EXP
- **Multi-LLM Support** — Works with Anthropic Claude, OpenAI, or any OpenAI-compatible API via `--base-url`
- **Multi-Pet** — Raise multiple pets simultaneously! Switch between pets with Tab key or `/switchpet`
- **LLM Response Cache** — Hybrid caching (exact match + template-based for feed/play) reduces token consumption. Pet evolution auto-invalidates stale cache
- **Persistent State** — Pet state saved automatically, survives restarts

## Quick Start

```bash
# Install dependencies
npm install

# Set your API key (first time only)
npx tsx src/index.tsx --api-key YOUR_KEY

# Or with OpenAI
npx tsx src/index.tsx --api-key YOUR_KEY --provider openai --model gpt-4o-mini

# Or with a custom API endpoint
npx tsx src/index.tsx --api-key YOUR_KEY --base-url https://your-api.example.com/v1
```

## Commands

| Command | Description |
|---|---|
| `/feed [food]` | Feed your pet. Specifying food triggers AI reaction (e.g., `/feed 鱼干`). Also consumes shop items from inventory |
| `/play [activity]` | Play with your pet. Specifying activity triggers AI reaction (e.g., `/play 追球`) |
| `/wish <animal>` | Make a wish during egg stage to decide what your pet hatches into |
| `/soul <trait>` | Set your pet's personality (e.g., `/soul 傲娇`, `/soul brave and kind`) |
| `/shop` | Browse the pet food shop catalog |
| `/buy <item>` | Purchase a food item with crypto (e.g., `/buy golden-apple`) |
| `/confirm` | Confirm a pending crypto payment |
| `/inventory` | View your pet's food inventory |
| `/wallet` | Show wallet status and configuration |
| `/addpet <name>` | Add a new pet |
| `/delpet` | Delete the active pet (with confirmation) |
| `/switchpet <name>` | Switch to a pet by name |
| `/cache` | Show LLM cache statistics |
| `/status` | Show current pet stats |
| `/help` | Show available commands |
| `/quit` | Exit the application |

Just type a message to chat with your pet — no command needed!  
Press **Tab** (with empty input) to cycle between pets.

## CLI Options

```
ai-pet [options]

Options:
  -n, --name <name>       Pet name (default: Mochi)
  -p, --provider <type>   AI provider: anthropic | openai (default: anthropic)
  -k, --api-key <key>     API key for the AI provider
  -m, --model <model>     AI model name (default: claude-sonnet-4-20250514)
  -u, --base-url <url>    Custom API base URL (for OpenAI-compatible endpoints)
  -V, --version           Output version number
  -h, --help              Display help
```

## Evolution System

| Stage | Name | Trigger |
|---|---|---|
| 1 | Egg | Starting stage. Hatch by raising mood to 90+ with warm words |
| 2 | Baby | EXP ≥ 100 |
| 3 | Teen | EXP ≥ 300 |
| 4 | Adult | EXP ≥ 600 |
| 5 | Legendary | EXP ≥ 1000 |

**Egg stage special mechanics:**
- Mood decays slowly (−0.2 per tick vs −0.5 for other stages)
- Positive words give double mood boost (+20 vs +10)
- Negative words have less effect (−2 vs −5)
- Hunger doesn't increase while still an egg

## Crypto Pet Food Shop

Buy premium food items for your pet using real crypto (USDT/USDC) via the [onchainos CLI](https://github.com/okx/onchainos-skills).

### Food Catalog

| Tier | Item | Price | Hunger | Mood | EXP |
|------|------|-------|--------|------|-----|
| COMMON | 🍎 Apple | $0.10 | -30 | +5 | +5 |
| COMMON | 🐟 Fresh Fish | $0.25 | -40 | +15 | +10 |
| COMMON | 🥩 Juicy Steak | $0.30 | -45 | +12 | +10 |
| RARE | ✨ Golden Apple | $0.50 | -50 | +25 | +25 |
| RARE | 🎂 Magic Cake | $0.75 | -40 | +35 | +30 |
| LEGENDARY | 🐉 Dragon Fruit | $1.00 | -60 | +50 | +50 |
| LEGENDARY | ⭐ Star Cookie | $2.00 | -50 | +60 | +75 |

### Setup

1. **Install onchainos CLI** — follow [okx/onchainos-skills](https://github.com/okx/onchainos-skills) installation guide
2. **Login** — run `onchainos wallet login` and complete email OTP verification
3. **Configure merchant address** — set your receiving wallet address in `ai-pet-data/config.json`:

```json
{
  "merchantAddress": "0xYourWalletAddress",
  "defaultChain": "base",
  "defaultToken": "USDT"
}
```

### Usage

```bash
# Browse the shop
/shop

# Buy a food item (pay with USDT)
/buy golden-apple

# Confirm a pending payment (when prompted)
/confirm

# Check your inventory
/inventory

# Feed your pet with a shop item (consumes from inventory)
/feed golden-apple

# Check wallet status
/wallet
```

### Supported Chains

| Chain | USDT | USDC |
|-------|------|------|
| Base | ✅ | ✅ |
| Ethereum | ✅ | ✅ |
| BSC | ✅ | ✅ |
| Arbitrum | ✅ | ✅ |
| Polygon | ✅ | ✅ |

Default chain is **Base** (low gas fees). Change via `defaultChain` in config.

### Payment Flow

```
/buy golden-apple
  → Checks wallet login status
  → Sends $0.50 USDT to merchant address
  → Exit code 0: Payment success, item added to inventory
  → Exit code 2: Confirmation required, type /confirm to proceed
  → Exit code 1: Payment failed, error displayed
```

## Pixel Art Protocol

The AI model can draw and animate your pet's appearance using a text-based pixel art format:

```
[SPRITE]
...YYYY...
..YYYYYY..
.YYYYYYYY.
YYYYYYYYYY
.YYYYKKYY.
..YYYYYY..
...YYYY...
[/SPRITE]
```

**Color codes:** `.`=transparent, `W`=white, `Y`=yellow, `G`=green, `R`=red, `B`=blue, `P`=pink, `K`=black, `O`=orange, `C`=cyan, `D`=gray

**Animation:** Send multiple `[SPRITE]` blocks for frame-by-frame animation (cycles at 2 FPS).

## Configuration

Config and state are stored in `./ai-pet-data/`:

- `config.json` — AI provider settings
- `cache.json` — LLM response cache (auto-managed)
- `pets/registry.json` — Pet registry (list of all pets + active pet)
- `pets/{petId}.json` — Per-pet state (auto-saved)
- `pets/{petId}-history.json` — Per-pet chat history
- `pets/{petId}-inventory.json` — Per-pet food inventory

> **Migration:** If upgrading from a single-pet version, the existing `state.json` is automatically migrated to the new `pets/` directory on first run.

Example `config.json`:
```json
{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "baseURL": "",
  "model": "claude-sonnet-4-20250514",
  "petName": "布朗",
  "merchantAddress": "0xYourWalletAddress",
  "defaultChain": "base",
  "defaultToken": "USDT"
}
```

## Project Structure

```
src/
├── index.tsx          # CLI entry point (commander)
├── app.tsx            # Main app component, game loop, multi-pet state
├── ai/
│   ├── provider.ts    # AI provider interface
│   ├── anthropic.ts   # Anthropic Claude adapter
│   ├── openai.ts      # OpenAI adapter
│   └── systemPrompt.ts # System prompt builder with pixel art protocol
├── cache/
│   ├── cacheTypes.ts  # Cache entry/data interfaces
│   ├── cacheKey.ts    # Cache key builder (exact match + template)
│   └── cacheManager.ts # Cache manager with TTL, LRU eviction
├── components/
│   ├── PetSprite.tsx  # Animated pixel sprite renderer
│   ├── StatusBar.tsx  # Mood/hunger/EXP progress bars
│   ├── ChatPanel.tsx  # Chat history display
│   ├── InputBar.tsx   # User input with Tab switching
│   ├── PetTabs.tsx    # Multi-pet tab bar
│   └── EvolutionAnimation.tsx # Evolution celebration
├── config/
│   ├── config.ts      # Config/state persistence (ai-pet-data/)
│   └── registry.ts    # Pet registry types
├── pet/
│   ├── petState.ts    # Pet state: mood, hunger, soul, wish, species, PetId
│   ├── evolution.ts   # Evolution stages & hatching logic
│   └── sprites.ts     # Default pixel sprite data per stage
├── shop/
│   ├── items.ts       # Food item catalog (7 items, 3 tiers)
│   ├── inventory.ts   # Per-pet inventory management
│   └── wallet.ts      # onchainos CLI wrapper for crypto payments
└── utils/
    └── pixel.tsx      # Pixel rendering, AI sprite parser, color map
```

## Tech Stack

- **Runtime:** Node.js ≥ 18
- **UI Framework:** [Ink](https://github.com/vadimdemedes/ink) (React for CLI)
- **AI:** Anthropic SDK / OpenAI SDK
- **Language:** TypeScript
- **Build:** tsup

## Development

```bash
# Development (hot reload)
npm run dev

# Build
npm run build

# Run built version
npm start
```

## License

MIT
