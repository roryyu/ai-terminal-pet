/**
 * OpenAI AI provider adapter.
 */

import OpenAI from 'openai';
import type { AIProvider, ChatMessage } from './provider.js';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini', baseURL?: string) {
    this.client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    this.model = model;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 500,
      messages: messages.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content,
      })),
    });

    return response.choices[0]?.message?.content ?? '';
  }
}
