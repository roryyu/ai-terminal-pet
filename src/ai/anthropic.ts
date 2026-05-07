/**
 * Anthropic (Claude) AI provider adapter.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIProvider, ChatMessage } from './provider.js';

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic';
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-sonnet-4-20250514', baseURL?: string) {
    this.client = new Anthropic({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    this.model = model;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    // Separate system message from conversation messages
    const systemMsg = messages.find(m => m.role === 'system')?.content ?? '';
    const convMessages = messages.filter(m => m.role !== 'system');

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 500,
      system: systemMsg,
      messages: convMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return textBlock ? (textBlock as { type: 'text'; text: string }).text : '';
  }
}
