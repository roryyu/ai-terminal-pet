/**
 * Main App component - ties together all UI elements and game logic.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { render, Box, Text, useApp } from 'ink';
import PetSprite from './components/PetSprite.js';
import StatusBar from './components/StatusBar.js';
import ChatPanel from './components/ChatPanel.js';
import InputBar from './components/InputBar.js';
import EvolutionAnimation from './components/EvolutionAnimation.js';
import type { PetState } from './pet/petState.js';
import { feedPet, playWithPet, chatInteraction, tickState, makeWish, resolveSpecies } from './pet/petState.js';
import { checkEvolution, getStageInfo } from './pet/evolution.js';
import type { AIProvider, ChatMessage } from './ai/provider.js';
import { buildChatMessages, extractSentiment, cleanResponse } from './ai/systemPrompt.js';
import { parseSpriteFromAI, stripSpriteFromResponse } from './utils/pixel.js';
import { saveState } from './config/config.js';

interface AppProps {
  initialState: PetState;
  provider: AIProvider;
}

const App: React.FC<AppProps> = ({ initialState, provider }) => {
  const { exit } = useApp();
  const [petState, setPetState] = useState<PetState>(initialState);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [infoText, setInfoText] = useState<string | null>(null);
  const [evolution, setEvolution] = useState<{ oldStage: number; newStage: number } | null>(null);

  // Save state on every change
  const prevStageRef = useRef(initialState.stage);

  useEffect(() => {
    saveState(petState);
  }, [petState]);

  // Periodic tick: hunger increases, mood decreases over time
  useEffect(() => {
    const interval = setInterval(() => {
      setPetState(prev => tickState(prev));
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleInput = useCallback(async (input: string) => {
    // Command handling
    if (input.startsWith('/')) {
      const cmd = input.toLowerCase().trim();

      // /feed [food] - feed the pet, optionally with a specific food
      if (cmd.startsWith('/feed')) {
        const food = input.slice(5).trim() || undefined;
        setPetState(prev => feedPet(prev, food));

        if (food) {
          // Send food to AI for review - treat as chat
          setBusy(true);
          try {
            const chatMessages = buildChatMessages(petState, messages, `[FEED] The user fed you: ${food}`);
            const rawResponse = await provider.chat(chatMessages);
            const sentiment = extractSentiment(rawResponse);
            const dynamicSpriteFrames = parseSpriteFromAI(rawResponse);
            const cleaned = cleanResponse(stripSpriteFromResponse(rawResponse));

            setMessages(prev => [
              ...prev,
              { role: 'user' as const, content: `/feed ${food}` },
              { role: 'assistant' as const, content: cleaned },
            ]);

            setPetState(prev => {
              const updated = chatInteraction(prev, sentiment);
              return { ...updated, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : prev.dynamicSprite };
            });
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setInfoText(`AI Error: ${errorMsg}`);
            setTimeout(() => setInfoText(null), 3000);
          } finally {
            setBusy(false);
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
        setPetState(prev => playWithPet(prev, activity));

        if (activity) {
          // Send activity to AI for review - treat as chat
          setBusy(true);
          try {
            const chatMessages = buildChatMessages(petState, messages, `[PLAY] The user wants to play with you: ${activity}`);
            const rawResponse = await provider.chat(chatMessages);
            const sentiment = extractSentiment(rawResponse);
            const dynamicSpriteFrames = parseSpriteFromAI(rawResponse);
            const cleaned = cleanResponse(stripSpriteFromResponse(rawResponse));

            setMessages(prev => [
              ...prev,
              { role: 'user' as const, content: `/play ${activity}` },
              { role: 'assistant' as const, content: cleaned },
            ]);

            setPetState(prev => {
              const updated = chatInteraction(prev, sentiment);
              return { ...updated, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : prev.dynamicSprite };
            });
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            setInfoText(`AI Error: ${errorMsg}`);
            setTimeout(() => setInfoText(null), 3000);
          } finally {
            setBusy(false);
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
        if (petState.stage !== 1) {
          setInfoText('You can only make a wish while your pet is an egg!');
          setTimeout(() => setInfoText(null), 3000);
          return;
        }
        if (!wishText) {
          setInfoText('Usage: /wish <animal or plant>  e.g. /wish cat, /wish dragon, /wish flower');
          setTimeout(() => setInfoText(null), 4000);
          return;
        }
        setPetState(prev => makeWish(prev, wishText));
        setInfoText(`You wished for a ${wishText}... The egg glows softly.`);
        setTimeout(() => setInfoText(null), 3000);
        return;
      }

      // /soul <trait> - set pet's personality / soul
      if (cmd.startsWith('/soul')) {
        const soulText = input.slice(5).trim();
        if (!soulText) {
          const currentSoul = petState.soul || 'none';
          setInfoText(`Current soul: ${currentSoul}. Usage: /soul <personality>  e.g. /soul 傲娇, /soul lazy and greedy, /soul 勇敢善良`);
          setTimeout(() => setInfoText(null), 4000);
          return;
        }
        setPetState(prev => ({ ...prev, soul: soulText }));
        setInfoText(`Soul set: ${soulText}. Your pet's personality has been shaped!`);
        setTimeout(() => setInfoText(null), 3000);
        return;
      }

      if (cmd === '/status') {
        const stageInfo = getStageInfo(petState.stage);
        setInfoText(`${petState.name} | Stage: ${stageInfo.name} | Mood: ${Math.round(petState.mood)} | Hunger: ${Math.round(petState.hunger)} | EXP: ${petState.experience}`);
        setTimeout(() => setInfoText(null), 4000);
        return;
      }

      if (cmd === '/help') {
        const eggCmds = petState.stage === 1 ? ' /wish <animal>' : '';
        setInfoText(`Commands: /feed [food] /play [activity] /soul <trait> /status /help /quit${eggCmds}`);
        setTimeout(() => setInfoText(null), 4000);
        return;
      }

      if (cmd === '/quit' || cmd === '/exit') {
        exit();
        return;
      }

      setInfoText('Unknown command. Type /help for available commands.');
      setTimeout(() => setInfoText(null), 2000);
      return;
    }

    // AI Chat
    setBusy(true);
    try {
      const chatMessages = buildChatMessages(petState, messages, input);
      const rawResponse = await provider.chat(chatMessages);
      const sentiment = extractSentiment(rawResponse);

      // Parse dynamic sprite from AI response
      const dynamicSpriteFrames = parseSpriteFromAI(rawResponse);
      // Clean both sentiment tags AND sprite blocks for display
      const cleaned = cleanResponse(stripSpriteFromResponse(rawResponse));

      setMessages(prev => [
        ...prev,
        { role: 'user' as const, content: input },
        { role: 'assistant' as const, content: cleaned },
      ]);

      // Update pet state based on chat
      setPetState(prev => {
        const updated = chatInteraction(prev, sentiment);

        // Check for evolution
        const newStage = checkEvolution(updated);
        if (newStage !== null) {
          setEvolution({ oldStage: updated.stage, newStage });
          // When hatching from egg, resolve species from wish
          const species = updated.stage === 1 ? resolveSpecies(updated.wish) : updated.species;
          return { ...updated, stage: newStage, species, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : prev.dynamicSprite };
        }
        // If AI sent a new sprite, update it; otherwise keep the previous one
        return { ...updated, dynamicSprite: dynamicSpriteFrames.length > 0 ? rawResponse : prev.dynamicSprite };
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setInfoText(`AI Error: ${errorMsg}`);
      setTimeout(() => setInfoText(null), 3000);
    } finally {
      setBusy(false);
    }
  }, [petState, messages, provider, exit]);

  const handleEvolutionComplete = useCallback(() => {
    setEvolution(null);
  }, []);

  return (
    <Box flexDirection="column">
      {/* Title */}
      <Box borderStyle="double" borderColor="magenta" paddingX={1}>
        <Text bold color="magenta">AI Terminal Pet</Text>
        <Text dimColor> | {provider.name} | </Text>
        <Text dimColor>/help for commands</Text>
      </Box>

      {/* Pet sprite (75%) + status bars (25%) side by side */}
      <Box flexDirection="row" borderStyle="single" borderColor="gray" paddingX={1}>
        <Box width="75%" justifyContent="center" alignItems="center">
          <PetSprite state={petState} />
        </Box>
        <Box position="absolute" right={1} top={1}>
          <StatusBar state={petState} />
        </Box>
      </Box>

      {/* Evolution animation overlay */}
      {evolution && (
        <EvolutionAnimation
          oldStage={evolution.oldStage}
          newStage={evolution.newStage}
          petName={petState.name}
          onComplete={handleEvolutionComplete}
        />
      )}

      {/* Chat panel */}
      <ChatPanel messages={messages} />

      {/* Info text (command feedback) */}
      {infoText && (
        <Box paddingX={1}>
          <Text color="yellow">{infoText}</Text>
        </Box>
      )}

      {/* Input */}
      <InputBar onSubmit={handleInput} disabled={busy} />
    </Box>
  );
};

/**
 * Boot the application.
 */
export function startApp(initialState: PetState, provider: AIProvider): Promise<void> {
  return new Promise((resolve) => {
    const { waitUntilExit } = render(
      <App initialState={initialState} provider={provider} />,
      { exitOnCtrlC: true }
    );
    waitUntilExit().then(() => resolve()).catch(() => resolve());
  });
}
