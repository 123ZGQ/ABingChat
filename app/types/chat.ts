export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
  }[];
} 