/**
 * Main App component - ties together all UI elements and game logic.
 * Supports multiple pets with tab switching.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { render, Box, Text, useApp } from 'ink';
import PetSprite from './components/PetSprite.js';
import StatusBar from './components/StatusBar.js';
import ChatPanel from './components/ChatPanel.js';
import InputBar from './components/InputBar.js';
import EvolutionAnimation from './components/EvolutionAnimation.js';
import PetTabs from './components/PetTabs.js';
import type { PetState, PetId } from './pet/petState.js';
import { createInitialState, feedPet, feedWithItem, playWithPet, chatInteraction, tickState, makeWish, resolveSpecies, generatePetId } from './pet/petState.js';
import { checkEvolution, getStageInfo } from './pet/evolution.js';
import type { AIProvider, ChatMessage } from './ai/provider.js';
import { buildChatMessages, extractSentiment, cleanResponse } from './ai/systemPrompt.js';
import { parseSpriteFromAI, stripSpriteFromResponse } from './utils/pixel.js';
import { savePetState, savePetHistory, savePetInventory, deletePetData, loadConfig } from './config/config.js';
import type { PetRegistry } from './config/registry.js';
import { saveRegistry } from './config/config.js';
import { CacheManager } from './cache/cacheManager.js';
import { buildCacheKey, detectInputType } from './cache/cacheKey.js';
import type { PetInventory } from './shop/inventory.js';
import { addItem, removeItem, getItemCount } from './shop/inventory.js';
import { SHOP_ITEMS, getItemById, TIER_LABELS, CHAIN_USDT_CONTRACTS } from './shop/items.js';
import type { ItemTier } from './shop/items.js';
import { checkWalletStatus, sendPayment } from './shop/wallet.js';

interface AppProps {
  initialPets: Record<string, PetState>;
  initialHistories: Record<string, ChatMessage[]>;
  initialInventories: Record<string, PetInventory>;
  initialActivePetId: string;
  initialRegistry: PetRegistry;
  provider: AIProvider;
}

const App: React.FC<AppProps> = ({ initialPets, initialHistories, initialInventories, initialActivePetId, initialRegistry, provider }) => {
  const { exit } = useApp();
  const [pets, setPets] = useState<Record<string, PetState>>(initialPets);
  const [histories, setHistories] = useState<Record<string, ChatMessage[]>>(initialHistories);
  const [inventories, setInventories] = useState<Record<string, PetInventory>>(initialInventories);
  const [activePetId, setActivePetId] = useState<string>(initialActivePetId);
  const [registry, setRegistry] = useState<PetRegistry>(initialRegistry);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [infoText, setInfoText] = useState<string | null>(null);
  const [evolutions, setEvolutions] = useState<Record<string, { oldStage: number; newStage: number } | null>>({});
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{
    itemId: string;
    amount: string;
    chain: string;
    tokenContract: string;
  } | null>(null);

  // Derived: active pet state and messages
  const activePet = pets[activePetId] ?? null;
  const activeMessages = histories[activePetId] ?? [];
  const activeInventory = inventories[activePetId] ?? { items: [] };
  const activeEvolution = evolutions[activePetId] ?? null;

  // Track which pet needs saving (avoid saving all pets on every render)
  const dirtyPetsRef = useRef<Set<string>>(new Set());
  const dirtyHistoriesRef = useRef<Set<string>>(new Set());
  const dirtyInventoriesRef = useRef<Set<string>>(new Set());

  // Cache manager for LLM response caching
  const cacheRef = useRef<CacheManager | null>(null);
  if (!cacheRef.current) {
    cacheRef.current = new CacheManager();
    cacheRef.current.load();
  }
  const cache = cacheRef.current;

  // Save dirty pets periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Swap sets to avoid race condition with concurrent modifications
      const dirtyPets = dirtyPetsRef.current;
      dirtyPetsRef.current = new Set();
      for (const petId of dirtyPets) {
        if (pets[petId]) savePetState(petId, pets[petId]);
      }

      const dirtyHistories = dirtyHistoriesRef.current;
      dirtyHistoriesRef.current = new Set();
      for (const petId of dirtyHistories) {
        if (histories[petId]) savePetHistory(petId, histories[petId]);
      }

      const dirtyInventories = dirtyInventoriesRef.current;
      dirtyInventoriesRef.current = new Set();
      for (const petId of dirtyInventories) {
        if (inventories[petId]) savePetInventory(petId, inventories[petId]);
      }

      // Periodic cache save
      cache.save();
    }, 2000);
    return () => clearInterval(interval);
  }, [pets, histories, inventories]);

  // Mark active pet dirty on state change
  useEffect(() => {
    if (activePetId && pets[activePetId]) {
      dirtyPetsRef.current.add(activePetId);
    }
  }, [pets, activePetId]);

  // Mark active pet history dirty on change
  useEffect(() => {
    if (activePetId && histories[activePetId]) {
      dirtyHistoriesRef.current.add(activePetId);
    }
  }, [histories, activePetId]);

  // Periodic tick: affects ALL pets
  useEffect(() => {
    const interval = setInterval(() => {
      setPets(prev => {
        const next = { ...prev };
        for (const petId of Object.keys(next)) {
          next[petId] = tickState(next[petId]);
          dirtyPetsRef.current.add(petId);
        }
        return next;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Pending delete timeout
  useEffect(() => {
    if (pendingDelete) {
      const timer = setTimeout(() => {
        setPendingDelete(null);
        setInfoText(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pendingDelete]);

  // Pending payment timeout
  useEffect(() => {
    if (pendingPayment) {
      const timer = setTimeout(() => {
        setPendingPayment(null);
        setInfoText(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [pendingPayment]);

  // Tab switching handler
  const handleTabSwitch = useCallback(() => {
    const petIds = registry.pets.map(p => p.id);
    if (petIds.length <= 1) return;
    const currentIndex = petIds.indexOf(activePetId);
    const nextIndex = (currentIndex + 1) % petIds.length;
    const nextPetId = petIds[nextIndex];
    setActivePetId(nextPetId);
    // Update registry activePetId
    const updatedRegistry = { ...registry, activePetId: nextPetId };
    setRegistry(updatedRegistry);
    saveRegistry(updatedRegistry);
  }, [registry, activePetId]);

  const handleInput = useCallback(async (input: string) => {
    if (!activePet) return;
    // Guard against concurrent AI calls using ref (avoids stale closure)
    if (busyRef.current) return;

    // Check for pending delete confirmation
    if (pendingDelete) {
      if (input.toLowerCase() === '/yes') {
        const petIdToDelete = pendingDelete;
        setPendingDelete(null);

        // Don't allow deleting the last pet
        if (registry.pets.length <= 1) {
          setInfoText('Cannot delete the last pet! Use /addpet to add another first.');
          setTimeout(() => setInfoText(null), 3000);
          return;
        }

        // Remove pet
        setPets(prev => {
          const next = { ...prev };
          delete next[petIdToDelete];
          return next;
        });
        setHistories(prev => {
          const next = { ...prev };
          delete next[petIdToDelete];
          return next;
        });
        setEvolutions(prev => {
          const next = { ...prev };
          delete next[petIdToDelete];
          return next;
        });

        // Update registry using functional updater to avoid stale closure
        setRegistry(prevReg => {
          const newPets = prevReg.pets.filter(p => p.id !== petIdToDelete);
          const newActiveId = petIdToDelete === activePetId ? newPets[0].id : activePetId;
          const updatedRegistry = { ...prevReg, pets: newPets, activePetId: newActiveId };
          saveRegistry(updatedRegistry);
          setActivePetId(newActiveId);
          return updatedRegistry;
        });

        // Delete files
        deletePetData(petIdToDelete);

        setInfoText(`Pet deleted.`);
        setTimeout(() => setInfoText(null), 3000);
      } else {
        setPendingDelete(null);
        setInfoText('Delete cancelled.');
        setTimeout(() => setInfoText(null), 2000);
      }
      return;
    }

    // Check for pending payment confirmation
    if (pendingPayment) {
      if (input.toLowerCase() === '/confirm') {
        const payment = pendingPayment;
        setPendingPayment(null);
        setBusy(true); busyRef.current = true;
        try {
          const config = loadConfig();
          const merchantAddr = config.merchantAddress;
          if (!merchantAddr) {
            setInfoText('Merchant address not configured. Set merchantAddress in ai-pet-data/config.json');
            setTimeout(() => setInfoText(null), 4000);
            return;
          }
          const result = await sendPayment(payment.amount, merchantAddr, payment.chain, payment.tokenContract, true);
          if (result.success && result.txHash) {
            setInventories(prev => {
              const inv = prev[activePetId] ?? { items: [] };
              const updated = addItem(inv, payment.itemId);
              dirtyInventoriesRef.current.add(activePetId);
              return { ...prev, [activePetId]: updated };
            });
            const item = getItemById(payment.itemId);
            setInfoText(`Payment successful! Got ${item?.emoji} ${item?.name}. TX: ${result.txHash}`);
            setTimeout(() => setInfoText(null), 5000);
          } else {
            setInfoText(`Payment failed: ${result.message}`);
            setTimeout(() => setInfoText(null), 4000);
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          setInfoText(`Payment error: ${errorMsg}`);
          setTimeout(() => setInfoText(null), 4000);
        } finally {
          setBusy(false); busyRef.current = false;
        }
      } else {
        setPendingPayment(null);
        setInfoText('Payment cancelled.');
        setTimeout(() => setInfoText(null), 2000);
      }
      return;
    }

    // Command handling
    if (input.startsWith('/')) {
      const cmd = input.toLowerCase().trim();

      // /addpet <name> - add a new pet
      if (cmd.startsWith('/addpet')) {
        const name = input.slice(7).trim();
        if (!name) {
          setInfoText('Usage: /addpet <name>');
          setTimeout(() => setInfoText(null), 3000);
          return;
        }
        const petId = generatePetId(name);
        const newState = createInitialState(name);
        setPets(prev => ({ ...prev, [petId]: newState }));
        setHistories(prev => ({ ...prev, [petId]: [] }));
        savePetState(petId, newState);

        const newPetEntry: PetId = { id: petId, name };
        const updatedRegistry = { ...registry, pets: [...registry.pets, newPetEntry] };
        setRegistry(updatedRegistry);
        saveRegistry(updatedRegistry);

        setInfoText(`Added pet "${name}"! Press Tab to switch to it.`);
        setTimeout(() => setInfoText(null), 3000);
        return;
      }

      // /delpet - delete the active pet (with confirmation)
      if (cmd === '/delpet') {
        setPendingDelete(activePetId);
        setInfoText(`Delete "${activePet.name}"? Type /yes to confirm.`);
        setTimeout(() => setInfoText(null), 5000);
        return;
      }

      // /switchpet <name> - switch to pet by name
      if (cmd.startsWith('/switchpet')) {
        const searchName = input.slice(10).trim().toLowerCase();
        if (!searchName) {
          setInfoText('Usage: /switchpet <name>');
          setTimeout(() => setInfoText(null), 3000);
          return;
        }
        const found = registry.pets.find(p => p.name.toLowerCase().includes(searchName));
        if (found) {
          setActivePetId(found.id);
          const updatedRegistry = { ...registry, activePetId: found.id };
          setRegistry(updatedRegistry);
          saveRegistry(updatedRegistry);
        } else {
          setInfoText(`Pet "${searchName}" not found.`);
          setTimeout(() => setInfoText(null), 3000);
        }
        return;
      }

      // /feed [food] - feed the pet, optionally with a specific food
      if (cmd.startsWith('/feed')) {
        const food = input.slice(5).trim() || undefined;

        // Check if feeding a shop item from inventory
        if (food) {
          const shopItem = getItemById(food.toLowerCase().replace(/\s+/g, '-'));
          if (shopItem) {
            const inv = inventories[activePetId] ?? { items: [] };
            const count = getItemCount(inv, shopItem.id);
            if (count <= 0) {
              setInfoText(`You don't have any ${shopItem.emoji} ${shopItem.name}! Use /buy ${shopItem.id} to purchase.`);
              setTimeout(() => setInfoText(null), 3000);
              return;
            }
            // Consume from inventory and apply enhanced stats
            const newInv = removeItem(inv, shopItem.id)!;
            setInventories(prev => ({ ...prev, [activePetId]: newInv }));
            dirtyInventoriesRef.current.add(activePetId);
            setPets(prev => ({ ...prev, [activePetId]: feedWithItem(prev[activePetId], shopItem) }));
            dirtyPetsRef.current.add(activePetId);
            setInfoText(`Fed ${shopItem.emoji} ${shopItem.name}! Hunger-${shopItem.hungerReduce} Mood+${shopItem.moodBoost} EXP+${shopItem.expBonus}`);
            setTimeout(() => setInfoText(null), 3000);

            // Trigger AI reaction
            setBusy(true); busyRef.current = true;
            try {
              const aiInput = `[FEED] The user fed you a special item: ${shopItem.name} (${shopItem.description}). React with extra excitement!`;
              const chatMessages = buildChatMessages(activePet, activeMessages, aiInput);
              const rawResponse = await provider.chat(chatMessages);
              const sentiment = extractSentiment(rawResponse);
              const dynamicSpriteFrames = parseSpriteFromAI(rawResponse);
              const cleaned = cleanResponse(stripSpriteFromResponse(rawResponse));

              setHistories(prev => ({
                ...prev,
                [activePetId]: [
                  ...(prev[activePetId] ?? []),
                  { role: 'user' as const, content: `/feed ${shopItem.id}` },
                  { role: 'assistant' as const, content: cleaned },
                ],
              }));
              dirtyHistoriesRef.current.add(activePetId);

              setPets(prev => {
                const pet = prev[activePetId];
                if (!pet) return prev;
                const updated = chatInteraction(pet, sentiment);
                dirtyPetsRef.current.add(activePetId);
                const newStage = checkEvolution(updated);
                if (newStage !== null) {
                  cache.invalidateStage(updated.stage);
                  setEvolutions(prevE => ({ ...prevE, [activePetId]: { oldStage: updated.stage, newStage } }));
                  const species = updated.stage === 1 ? resolveSpecies(updated.wish) : updated.species;
                  return { ...prev, [activePetId]: { ...updated, stage: newStage, species, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
                }
                return { ...prev, [activePetId]: { ...updated, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
              });
            } catch (err: unknown) {
              const errorMsg = err instanceof Error ? err.message : 'Unknown error';
              setInfoText(`AI Error: ${errorMsg}`);
              setTimeout(() => setInfoText(null), 3000);
            } finally {
              setBusy(false); busyRef.current = false;
            }
            return;
          }
        }

        // Fall through to original free-form feed
        setPets(prev => ({ ...prev, [activePetId]: feedPet(prev[activePetId], food) }));
        dirtyPetsRef.current.add(activePetId);

        if (food) {
          setBusy(true); busyRef.current = true;
          try {
            const aiInput = `[FEED] The user fed you: ${food}`;
            const cacheKey = buildCacheKey('feed', food, activePet.stage, activePet.species);
            const cached = cache.get(cacheKey);
            let rawResponse: string;

            if (cached) {
              rawResponse = cached.rawResponse;
            } else {
              const chatMessages = buildChatMessages(activePet, activeMessages, aiInput);
              rawResponse = await provider.chat(chatMessages);
              cache.set(cacheKey, rawResponse);
            }

            const sentiment = extractSentiment(rawResponse);
            const dynamicSpriteFrames = parseSpriteFromAI(rawResponse);
            const cleaned = cleanResponse(stripSpriteFromResponse(rawResponse));

            setHistories(prev => ({
              ...prev,
              [activePetId]: [
                ...(prev[activePetId] ?? []),
                { role: 'user' as const, content: `/feed ${food}` },
                { role: 'assistant' as const, content: cleaned },
              ],
            }));
            dirtyHistoriesRef.current.add(activePetId);

            setPets(prev => {
              const pet = prev[activePetId];
              if (!pet) return prev;
              const updated = chatInteraction(pet, sentiment);
              dirtyPetsRef.current.add(activePetId);

              // Check for evolution
              const newStage = checkEvolution(updated);
              if (newStage !== null) {
                cache.invalidateStage(updated.stage);
                setEvolutions(prevE => ({ ...prevE, [activePetId]: { oldStage: updated.stage, newStage } }));
                const species = updated.stage === 1 ? resolveSpecies(updated.wish) : updated.species;
                return { ...prev, [activePetId]: { ...updated, stage: newStage, species, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
              }
              return { ...prev, [activePetId]: { ...updated, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
            });
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setInfoText(`AI Error: ${errorMsg}`);
            setTimeout(() => setInfoText(null), 3000);
          } finally {
            setBusy(false); busyRef.current = false;
          }
        } else {
          setInfoText('You fed your pet! Hunger decreased. Tip: /feed <food> to feed something specific!');
          setTimeout(() => setInfoText(null), 3000);
        }
        return;
      }

      // /play [activity] - play with the pet, optionally with a specific activity
      if (cmd.startsWith('/play')) {
        const activity = input.slice(5).trim() || undefined;
        setPets(prev => ({ ...prev, [activePetId]: playWithPet(prev[activePetId], activity) }));
        dirtyPetsRef.current.add(activePetId);

        if (activity) {
          setBusy(true); busyRef.current = true;
          try {
            const aiInput = `[PLAY] The user wants to play with you: ${activity}`;
            const cacheKey = buildCacheKey('play', activity, activePet.stage, activePet.species);
            const cached = cache.get(cacheKey);
            let rawResponse: string;

            if (cached) {
              rawResponse = cached.rawResponse;
            } else {
              const chatMessages = buildChatMessages(activePet, activeMessages, aiInput);
              rawResponse = await provider.chat(chatMessages);
              cache.set(cacheKey, rawResponse);
            }

            const sentiment = extractSentiment(rawResponse);
            const dynamicSpriteFrames = parseSpriteFromAI(rawResponse);
            const cleaned = cleanResponse(stripSpriteFromResponse(rawResponse));

            setHistories(prev => ({
              ...prev,
              [activePetId]: [
                ...(prev[activePetId] ?? []),
                { role: 'user' as const, content: `/play ${activity}` },
                { role: 'assistant' as const, content: cleaned },
              ],
            }));
            dirtyHistoriesRef.current.add(activePetId);

            setPets(prev => {
              const pet = prev[activePetId];
              if (!pet) return prev;
              const updated = chatInteraction(pet, sentiment);
              dirtyPetsRef.current.add(activePetId);

              const newStage = checkEvolution(updated);
              if (newStage !== null) {
                cache.invalidateStage(updated.stage);
                setEvolutions(prevE => ({ ...prevE, [activePetId]: { oldStage: updated.stage, newStage } }));
                const species = updated.stage === 1 ? resolveSpecies(updated.wish) : updated.species;
                return { ...prev, [activePetId]: { ...updated, stage: newStage, species, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
              }
              return { ...prev, [activePetId]: { ...updated, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
            });
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setInfoText(`AI Error: ${errorMsg}`);
            setTimeout(() => setInfoText(null), 3000);
          } finally {
            setBusy(false); busyRef.current = false;
          }
        } else {
          setInfoText('You played with your pet! Mood increased! Tip: /play <activity> to play something specific!');
          setTimeout(() => setInfoText(null), 3000);
        }
        return;
      }

      // /wish <something> - make a wish during egg stage
      if (cmd.startsWith('/wish')) {
        const wishText = input.slice(5).trim();
        if (activePet.stage !== 1) {
          setInfoText('You can only make a wish while your pet is an egg!');
          setTimeout(() => setInfoText(null), 3000);
          return;
        }
        if (!wishText) {
          setInfoText('Usage: /wish <animal or plant>  e.g. /wish cat, /wish dragon, /wish flower');
          setTimeout(() => setInfoText(null), 4000);
          return;
        }
        setPets(prev => ({ ...prev, [activePetId]: makeWish(prev[activePetId], wishText) }));
        dirtyPetsRef.current.add(activePetId);
        setInfoText(`You wished for a ${wishText}... The egg glows softly.`);
        setTimeout(() => setInfoText(null), 3000);
        return;
      }

      // /soul <trait> - set pet's personality / soul
      if (cmd.startsWith('/soul')) {
        const soulText = input.slice(5).trim();
        if (!soulText) {
          const currentSoul = activePet.soul || 'none';
          setInfoText(`Current soul: ${currentSoul}. Usage: /soul <personality>  e.g. /soul 傲娇, /soul lazy and greedy, /soul 勇敢善良`);
          setTimeout(() => setInfoText(null), 4000);
          return;
        }
        setPets(prev => ({ ...prev, [activePetId]: { ...prev[activePetId], soul: soulText } }));
        dirtyPetsRef.current.add(activePetId);
        setInfoText(`Soul set: ${soulText}. Your pet's personality has been shaped!`);
        setTimeout(() => setInfoText(null), 3000);
        return;
      }

      // /shop - display food shop catalog
      if (cmd === '/shop') {
        const tiers: ItemTier[] = ['common', 'rare', 'legendary'];
        const lines: string[] = ['Pet Food Shop:'];
        for (const tier of tiers) {
          const items = SHOP_ITEMS.filter(i => i.tier === tier);
          lines.push(`  ${TIER_LABELS[tier]}:`);
          for (const item of items) {
            lines.push(`    ${item.emoji} ${item.name.padEnd(14)} $${item.priceUsd.toFixed(2).padStart(5)}  Hunger-${item.hungerReduce} Mood+${item.moodBoost} EXP+${item.expBonus}`);
          }
        }
        lines.push('  Use /buy <item> to purchase. /inventory to check.');
        setInfoText(lines.join('\n'));
        setTimeout(() => setInfoText(null), 15000);
        return;
      }

      // /buy <item> - purchase a food item with crypto
      if (cmd.startsWith('/buy')) {
        const itemArg = input.slice(4).trim().toLowerCase().replace(/\s+/g, '-');
        if (!itemArg) {
          setInfoText('Usage: /buy <item>  e.g. /buy golden-apple, /buy fish');
          setTimeout(() => setInfoText(null), 3000);
          return;
        }
        const item = getItemById(itemArg);
        if (!item) {
          setInfoText(`Unknown item "${itemArg}". Use /shop to see available items.`);
          setTimeout(() => setInfoText(null), 3000);
          return;
        }

        const config = loadConfig();
        if (!config.merchantAddress) {
          setInfoText('Merchant address not configured. Set merchantAddress in ai-pet-data/config.json');
          setTimeout(() => setInfoText(null), 4000);
          return;
        }

        setBusy(true); busyRef.current = true;
        try {
          const walletStatus = await checkWalletStatus();
          if (!walletStatus.loggedIn) {
            setInfoText(`Not logged in. Please run: onchainos wallet login`);
            setTimeout(() => setInfoText(null), 4000);
            return;
          }

          const chain = config.defaultChain || 'base';
          const tokenContract = CHAIN_USDT_CONTRACTS[chain];
          const amount = item.priceUsd.toFixed(2);

          const result = await sendPayment(amount, config.merchantAddress, chain, tokenContract);
          if (result.needsConfirmation) {
            setPendingPayment({ itemId: item.id, amount, chain, tokenContract: tokenContract || '' });
            setInfoText(`Payment of $${amount} USDT for ${item.emoji} ${item.name}. Type /confirm to proceed or anything else to cancel.`);
            setTimeout(() => setInfoText(null), 30000);
          } else if (result.success && result.txHash) {
            setInventories(prev => {
              const inv = prev[activePetId] ?? { items: [] };
              const updated = addItem(inv, item.id);
              dirtyInventoriesRef.current.add(activePetId);
              return { ...prev, [activePetId]: updated };
            });
            setInfoText(`Payment successful! Got ${item.emoji} ${item.name}. TX: ${result.txHash}`);
            setTimeout(() => setInfoText(null), 5000);
          } else {
            setInfoText(`Payment failed: ${result.message}`);
            setTimeout(() => setInfoText(null), 4000);
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          setInfoText(`Payment error: ${errorMsg}`);
          setTimeout(() => setInfoText(null), 4000);
        } finally {
          setBusy(false); busyRef.current = false;
        }
        return;
      }

      // /inventory - show current pet's food inventory
      if (cmd === '/inventory') {
        const inv = inventories[activePetId] ?? { items: [] };
        if (inv.items.length === 0) {
          setInfoText('Inventory is empty. Use /shop to browse and /buy to purchase food!');
          setTimeout(() => setInfoText(null), 3000);
          return;
        }
        const lines = ['Inventory:'];
        for (const entry of inv.items) {
          const item = getItemById(entry.itemId);
          if (item) {
            lines.push(`  ${item.emoji} ${item.name.padEnd(14)} x${entry.quantity}`);
          }
        }
        lines.push('  Use /feed <item> to feed your pet.');
        setInfoText(lines.join('\n'));
        setTimeout(() => setInfoText(null), 10000);
        return;
      }

      // /wallet - show wallet status and balance
      if (cmd === '/wallet') {
        setBusy(true); busyRef.current = true;
        try {
          const walletStatus = await checkWalletStatus();
          if (!walletStatus.loggedIn) {
            setInfoText('Wallet: Not logged in. Run: onchainos wallet login');
            setTimeout(() => setInfoText(null), 4000);
            return;
          }
          const config = loadConfig();
          setInfoText(`Wallet: ${walletStatus.address ?? 'connected'} | Chain: ${config.defaultChain} | Token: ${config.defaultToken} | Merchant: ${config.merchantAddress || 'not set'}`);
          setTimeout(() => setInfoText(null), 5000);
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          setInfoText(`Wallet error: ${errorMsg}`);
          setTimeout(() => setInfoText(null), 4000);
        } finally {
          setBusy(false); busyRef.current = false;
        }
        return;
      }

      if (cmd === '/cache') {
        const stats = cache.getStats();
        const oldestMin = Math.round(stats.oldestAgeMs / 60000);
        setInfoText(`Cache: ${stats.totalEntries} entries | ${stats.totalHits} hits | oldest: ${oldestMin}m ago`);
        setTimeout(() => setInfoText(null), 4000);
        return;
      }

      if (cmd === '/status') {
        const stageInfo = getStageInfo(activePet.stage);
        const invCount = (inventories[activePetId] ?? { items: [] }).items.reduce((sum, e) => sum + e.quantity, 0);
        setInfoText(`${activePet.name} | Stage: ${stageInfo.name} | Mood: ${Math.round(activePet.mood)} | Hunger: ${Math.round(activePet.hunger)} | EXP: ${activePet.experience} | Items: ${invCount}`);
        setTimeout(() => setInfoText(null), 4000);
        return;
      }

      if (cmd === '/help') {
        const eggCmds = activePet.stage === 1 ? ' /wish <animal>' : '';
        setInfoText(`Commands: /feed [food] /play [activity] /soul <trait> /addpet <name> /delpet /switchpet <name> /shop /buy <item> /inventory /wallet /cache /status /help /quit${eggCmds}`);
        setTimeout(() => setInfoText(null), 4000);
        return;
      }

      if (cmd === '/quit' || cmd === '/exit') {
        // Save all dirty data before exit
        for (const petId of dirtyPetsRef.current) {
          if (pets[petId]) savePetState(petId, pets[petId]);
        }
        for (const petId of dirtyHistoriesRef.current) {
          if (histories[petId]) savePetHistory(petId, histories[petId]);
        }
        for (const petId of dirtyInventoriesRef.current) {
          if (inventories[petId]) savePetInventory(petId, inventories[petId]);
        }
        cache.save();
        exit();
        return;
      }

      setInfoText('Unknown command. Type /help for available commands.');
      setTimeout(() => setInfoText(null), 2000);
      return;
    }

    // AI Chat
    setBusy(true); busyRef.current = true;
    try {
      const cacheKey = buildCacheKey('chat', input, activePet.stage, activePet.species);
      const cached = cache.get(cacheKey);
      let rawResponse: string;

      if (cached) {
        rawResponse = cached.rawResponse;
      } else {
        const chatMessages = buildChatMessages(activePet, activeMessages, input);
        rawResponse = await provider.chat(chatMessages);
        cache.set(cacheKey, rawResponse);
      }

      const sentiment = extractSentiment(rawResponse);

      // Parse dynamic sprite from AI response
      const dynamicSpriteFrames = parseSpriteFromAI(rawResponse);
      // Clean both sentiment tags AND sprite blocks for display
      const cleaned = cleanResponse(stripSpriteFromResponse(rawResponse));

      setHistories(prev => ({
        ...prev,
        [activePetId]: [
          ...(prev[activePetId] ?? []),
          { role: 'user' as const, content: input },
          { role: 'assistant' as const, content: cleaned },
        ],
      }));
      dirtyHistoriesRef.current.add(activePetId);

      // Update pet state based on chat
      setPets(prev => {
        const pet = prev[activePetId];
        if (!pet) return prev;
        const updated = chatInteraction(pet, sentiment);
        dirtyPetsRef.current.add(activePetId);

        // Check for evolution
        const newStage = checkEvolution(updated);
        if (newStage !== null) {
          cache.invalidateStage(updated.stage);
          setEvolutions(prevE => ({ ...prevE, [activePetId]: { oldStage: updated.stage, newStage } }));
          // When hatching from egg, resolve species from wish
          const species = updated.stage === 1 ? resolveSpecies(updated.wish) : updated.species;
          return { ...prev, [activePetId]: { ...updated, stage: newStage, species, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
        }
        // If AI sent a new sprite, update it; otherwise keep the previous one
        return { ...prev, [activePetId]: { ...updated, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : pet.dynamicSprite } };
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setInfoText(`AI Error: ${errorMsg}`);
      setTimeout(() => setInfoText(null), 3000);
    } finally {
      setBusy(false); busyRef.current = false;
    }
  }, [pets, histories, inventories, activePetId, activePet, activeMessages, provider, exit, registry, pendingDelete, pendingPayment]);

  const handleEvolutionComplete = useCallback(() => {
    setEvolutions(prev => ({ ...prev, [activePetId]: null }));
  }, [activePetId]);

  return (
    <Box flexDirection="column">
      {/* Title */}
      <Box borderStyle="double" borderColor="magenta" paddingX={1}>
        <Text bold color="magenta">AI Terminal Pet</Text>
        <Text dimColor> | {provider.name} | </Text>
        <Text dimColor>/help for commands</Text>
      </Box>

      {/* Pet tabs */}
      <PetTabs pets={registry.pets} activePetId={activePetId} />

      {/* Pet sprite + status bars side by side */}
      <Box flexDirection="row" borderStyle="single" borderColor="gray" paddingX={1}>
        <Box width="75%" justifyContent="center" alignItems="center">
          {activePet && <PetSprite state={activePet} />}
        </Box>
        <Box position="absolute" right={1} top={1}>
          {activePet && <StatusBar state={activePet} />}
        </Box>
      </Box>

      {/* Evolution animation overlay */}
      {activeEvolution && activePet && (
        <EvolutionAnimation
          oldStage={activeEvolution.oldStage}
          newStage={activeEvolution.newStage}
          petName={activePet.name}
          onComplete={handleEvolutionComplete}
        />
      )}

      {/* Chat panel */}
      <ChatPanel messages={activeMessages} />

      {/* Info text (command feedback) */}
      {infoText && (
        <Box paddingX={1}>
          <Text color="yellow">{infoText}</Text>
        </Box>
      )}

      {/* Input */}
      <InputBar onSubmit={handleInput} onTab={handleTabSwitch} disabled={busy} />
    </Box>
  );
};

/**
 * Boot the application.
 */
export function startApp(
  initialPets: Record<string, PetState>,
  initialHistories: Record<string, ChatMessage[]>,
  initialInventories: Record<string, PetInventory>,
  initialActivePetId: string,
  initialRegistry: PetRegistry,
  provider: AIProvider,
): Promise<void> {
  return new Promise((resolve) => {
    const { waitUntilExit } = render(
      <App
        initialPets={initialPets}
        initialHistories={initialHistories}
        initialInventories={initialInventories}
        initialActivePetId={initialActivePetId}
        initialRegistry={initialRegistry}
        provider={provider}
      />,
      { exitOnCtrlC: true }
    );
    waitUntilExit().then(() => resolve()).catch(() => resolve());
  });
}
