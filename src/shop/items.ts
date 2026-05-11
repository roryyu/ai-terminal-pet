/**
 * Pet food shop item catalog.
 */

export type ItemTier = 'common' | 'rare' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  tier: ItemTier;
  priceUsd: number;
  hungerReduce: number;
  moodBoost: number;
  expBonus: number;
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Common tier
  { id: 'apple',        name: 'Apple',          emoji: '\u{1F34E}', tier: 'common',    priceUsd: 0.10, hungerReduce: 30, moodBoost: 5,  expBonus: 5,  description: 'A simple apple. Your pet munches happily.' },
  { id: 'fish',         name: 'Fresh Fish',     emoji: '\u{1F41F}', tier: 'common',    priceUsd: 0.25, hungerReduce: 40, moodBoost: 15, expBonus: 10, description: 'Fresh from the stream! Cats and dragons love this.' },
  { id: 'steak',        name: 'Juicy Steak',    emoji: '\u{1F969}', tier: 'common',    priceUsd: 0.30, hungerReduce: 45, moodBoost: 12, expBonus: 10, description: 'A thick, juicy steak. Pure protein power.' },
  // Rare tier
  { id: 'golden-apple', name: 'Golden Apple',   emoji: '\u{2728}',  tier: 'rare',      priceUsd: 0.50, hungerReduce: 50, moodBoost: 25, expBonus: 25, description: 'A shimmering golden apple from enchanted orchards.' },
  { id: 'magic-cake',   name: 'Magic Cake',     emoji: '\u{1F382}', tier: 'rare',      priceUsd: 0.75, hungerReduce: 40, moodBoost: 35, expBonus: 30, description: 'Sparkles with every bite. Makes your pet dance!' },
  // Legendary tier
  { id: 'dragon-fruit',  name: 'Dragon Fruit',  emoji: '\u{1F409}', tier: 'legendary', priceUsd: 1.00, hungerReduce: 60, moodBoost: 50, expBonus: 50, description: 'A mythical fruit said to grant dragon powers.' },
  { id: 'star-cookie',   name: 'Star Cookie',   emoji: '\u{2B50}',  tier: 'legendary', priceUsd: 2.00, hungerReduce: 50, moodBoost: 60, expBonus: 75, description: 'Baked with stardust. Maximum happiness guaranteed.' },
];

export function getItemById(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id);
}

export function getItemsByTier(tier: ItemTier): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.tier === tier);
}

export const TIER_LABELS: Record<ItemTier, string> = {
  common: 'COMMON',
  rare: 'RARE',
  legendary: 'LEGENDARY',
};

/** Chain -> USDT contract address mapping */
export const CHAIN_USDT_CONTRACTS: Record<string, string> = {
  base:       '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  ethereum:   '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  bsc:        '0x55d398326f99059fF775485246999027B3197955',
  arbitrum:   '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  polygon:    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
};
