/**
 * InputBar component - user text input for chatting with the pet.
 */

import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface InputBarProps {
  onSubmit: (value: string) => void;
  disabled: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSubmit, disabled }) => {
  const [input, setInput] = useState('');

  useInput((ch, key) => {
    if (disabled) return;

    if (key.return) {
      const trimmed = input.trim();
      if (trimmed) {
        onSubmit(trimmed);
        setInput('');
      }
      return;
    }

    if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
      return;
    }

    // Ignore control characters
    if (ch && !key.ctrl && !key.meta) {
      setInput(prev => prev + ch);
    }
  });

  return (
    <Box borderStyle="single" borderColor={disabled ? 'gray' : 'cyan'} paddingX={1}>
      <Box marginRight={1}>
        {disabled ? (
          <Text color="yellow">...</Text>
        ) : (
          <Text bold color="cyan">&gt;</Text>
        )}
      </Box>
      <Text dimColor={disabled}>
        {disabled ? 'Thinking...' : (input || 'Type a message or /command...')}
      </Text>
      {!disabled && input && <Text dimColor>_</Text>}
    </Box>
  );
};

export default InputBar;
