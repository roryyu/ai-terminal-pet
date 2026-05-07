/**
 * ChatPanel component - displays conversation history.
 */

import React from 'react';
import { Box, Text } from 'ink';
import type { ChatMessage } from '../ai/provider.js';

interface ChatPanelProps {
  messages: ChatMessage[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages }) => {
  // Only show user and assistant messages (not system)
  const visibleMessages = messages.filter(m => m.role !== 'system');

  if (visibleMessages.length === 0) {
    return (
      <Box paddingX={1}>
        <Text dimColor>Say hi to your pet! Type a message below...</Text>
      </Box>
    );
  }

  // Show last 8 messages to keep the display compact
  const recentMessages = visibleMessages.slice(-8);

  return (
    <Box flexDirection="column" paddingX={1}>
      {recentMessages.map((msg, i) => {
        if (msg.role === 'user') {
          return (
            <Box key={i} flexDirection="row">
              <Text bold color="blue">You: </Text>
              <Text>{msg.content}</Text>
            </Box>
          );
        }
        return (
          <Box key={i} flexDirection="row">
            <Text bold color="green">Pet: </Text>
            <Text>{msg.content}</Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default ChatPanel;
