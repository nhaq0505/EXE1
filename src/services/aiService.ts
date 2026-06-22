import { api } from './api';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatResponse {
  text: string;
}

export const aiService = {
  chat: async (history: ChatMessage[], message: string): Promise<ChatResponse> => {
    const response = await api.post<any>('/api/ai/chat', { history, message });
    return {
      text: response.text || response.responseText || ''
    };
  }
};
