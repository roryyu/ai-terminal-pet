/**
 * Pet state management - mood, hunger, experience, evolution stage.
 */

/** Pet identifier for multi-pet registry */
export interface PetId {
  id: string;    // filesystem-safe unique ID
  name: string;  // display name for tab rendering
}

/** Generate a unique, filesystem-safe pet ID from name */
export function generatePetId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '-').replace(/-+/g, '-').slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}

export interface PetState {
  name: string;
  stage: number;       // 1-5 evolution stage
  mood: number;        // 0-100 (higher = happier)
  hunger: number;      // 0-100 (higher = hungrier)
  experience: number;  // 0+ accumulates with interactions
  wish: string;        // wish made during egg stage (e.g. "cat", "dragon")
  species: string;     // determined when hatching, based on wish
  dynamicSprite: string | null;  // AI-generated sprite text (raw [SPRITE] grid), null = use default
  soul: string;        // personality trait / soul description set by user
  createdAt: string;   // ISO date string
  lastFedAt: string;   // ISO date string
  lastChatAt: string;  // ISO date string
}

export function createInitialState(name: string = 'Pet'): PetState {
  const now = new Date().toISOString();
  return {
    name,
    stage: 1,
    mood: 70,
    hunger: 20,
    experience: 0,
    wish: '',
    species: '',
    dynamicSprite: null,
    soul: '',
    createdAt: now,
    lastFedAt: now,
    lastChatAt: now,
  };
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Add experience and return updated state (does not auto-evolve) */
export function addExperience(state: PetState, amount: number): PetState {
  return {
    ...state,
    experience: Math.max(0, state.experience + amount),
  };
}

/** Feed the pet: reduces hunger, slightly increases mood */
export function feedPet(state: PetState, food?: string): PetState {
  // Favorite foods give bigger mood boost
  const favorites = ['fish', 'meat', 'chicken', 'beef', 'salmon', 'tuna', 'shrimp', '鱼', '肉', '鸡', '虾'];
  const isFavorite = food ? favorites.some(f => food.toLowerCase().includes(f)) : false;
  const moodBoost = isFavorite ? 15 : 5;
  const hungerReduce = isFavorite ? 40 : 30;

  return {
    ...state,
    hunger: clamp(state.hunger - hungerReduce, 0, 100),
    mood: clamp(state.mood + moodBoost, 0, 100),
    lastFedAt: new Date().toISOString(),
  };
}

/** Play with the pet: increases mood, slightly increases hunger */
export function playWithPet(state: PetState, activity?: string): PetState {
  // Exciting activities give bigger mood boost
  const exciting = ['ball', 'chase', 'fetch', 'run', 'jump', 'swim', 'dance', 'hide', 'seek', 'ball', '球', '追', '跑', '跳', '游'];
  const isExciting = activity ? exciting.some(a => activity.toLowerCase().includes(a)) : false;
  const moodBoost = isExciting ? 25 : 15;

  return {
    ...state,
    mood: clamp(state.mood + moodBoost, 0, 100),
    hunger: clamp(state.hunger + 5, 0, 100),
  };
}

/** Chat interaction: increases experience, affects mood based on sentiment */
export function chatInteraction(state: PetState, sentiment: 'positive' | 'neutral' | 'negative'): PetState {
  // Egg stage: mood is more sensitive, positive words give bigger boost
  const isEgg = state.stage === 1;
  const moodChange = sentiment === 'positive'
    ? (isEgg ? 20 : 10)  // egg gets double mood from positive words!
    : sentiment === 'negative'
    ? (isEgg ? -2 : -5)  // egg is less affected by negativity
    : (isEgg ? 5 : 2);
  const expGain = sentiment === 'positive' ? 15 : sentiment === 'negative' ? 5 : 10;
  return {
    ...state,
    mood: clamp(state.mood + moodChange, 0, 100),
    hunger: clamp(state.hunger + 2, 0, 100),
    experience: state.experience + expGain,
    lastChatAt: new Date().toISOString(),
  };
}

/** Tick: called periodically to simulate time passing */
export function tickState(state: PetState): PetState {
  // Egg stage: mood decays slower, hunger doesn't increase yet
  if (state.stage === 1) {
    return {
      ...state,
      mood: clamp(state.mood - 0.2, 0, 100), // very slow mood decay for egg
    };
  }
  return {
    ...state,
    hunger: clamp(state.hunger + 1, 0, 100),
    mood: clamp(state.mood - 0.5, 0, 100),
  };
}

/** Get mood label */
export function getMoodLabel(mood: number): string {
  if (mood >= 80) return '😄';
  if (mood >= 60) return '😊';
  if (mood >= 40) return '😐';
  if (mood >= 20) return '😢';
  return '😭';
}

/** Get hunger label (higher value = more hungry) */
export function getHungerLabel(hunger: number): string {
  if (hunger >= 80) return '🤤';
  if (hunger >= 60) return '🍖';
  if (hunger >= 40) return '😋';
  if (hunger >= 20) return '😌';
  return '💯';
}

/** Make a wish during egg stage */
export function makeWish(state: PetState, wish: string): PetState {
  if (state.stage !== 1) return state; // only during egg stage
  return {
    ...state,
    wish: wish.trim(),
  };
}

/** Resolve species from wish when hatching */
export function resolveSpecies(wish: string): string {
  const w = wish.toLowerCase().trim();
  if (!w) return 'Slime'; // default if no wish

  // Map common wishes to species names
  const speciesMap: Record<string, string> = {
    // Cats
    'cat': 'Kitty', 'kitten': 'Kitty', '猫咪': 'Kitty', '猫': 'Kitty',
    // Dogs
    'dog': 'Puppy', 'puppy': 'Puppy', '小狗': 'Puppy', '狗': 'Puppy',
    // Dragons
    'dragon': 'Dragon', '龙': 'Dragon', '飞龙': 'Dragon',
    // Birds
    'bird': 'Chick', 'chicken': 'Chick', '小鸟': 'Chick', '鸟': 'Chick',
    // Bunnies
    'bunny': 'Bunny', 'rabbit': 'Bunny', '兔': 'Bunny', '兔子': 'Bunny',
    // Fish
    'fish': 'Fish', '鱼': 'Fish', '小鱼': 'Fish',
    // Foxes
    'fox': 'Fox', '狐狸': 'Fox',
    // Bears
    'bear': 'Bear', '小熊': 'Bear', '熊': 'Bear',
    // Plants/flowers
    'flower': 'Flower', 'plant': 'Sapling', '花': 'Flower', '植物': 'Sapling',
    '树': 'Sapling', 'tree': 'Sapling', '草': 'Sapling',
    // Mushrooms
    'mushroom': 'Mushroom', '蘑菇': 'Mushroom',
    // Slimes
    'slime': 'Slime', '史莱姆': 'Slime',
  };

  // Try exact match first
  if (speciesMap[w]) return speciesMap[w];

  // Try partial match
  for (const [key, value] of Object.entries(speciesMap)) {
    if (w.includes(key) || key.includes(w)) return value;
  }

  // If no match, capitalize the wish as species name
  return w.charAt(0).toUpperCase() + w.slice(1);
}

/** Get body color based on species */
export function getSpeciesColor(species: string): string {
  const colorMap: Record<string, string> = {
    'Kitty': 'yellow',
    'Puppy': 'yellow',
    'Dragon': 'red',
    'Chick': 'yellow',
    'Bunny': 'magenta',
    'Fish': 'blue',
    'Fox': 'yellow',
    'Bear': 'yellow',
    'Flower': 'magenta',
    'Sapling': 'green',
    'Mushroom': 'red',
    'Slime': 'green',
  };
  return colorMap[species] ?? 'green';
}
