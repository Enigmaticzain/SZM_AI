// AI-to-AI Conversation Manager
// Enables multiple AIs to talk to each other for collaborative learning

export interface AIMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  response?: string;
  timestamp: Date;
  confidence?: number;
  context?: string;
  status?: 'pending' | 'thinking' | 'complete' | 'error';
}

export interface AIConversationLog {
  id: string;
  participants: string[];
  messages: AIMessage[];
  createdAt: Date;
  topic: string;
  summary?: string;
}

export class AIMultiplexer {
  private conversations: Map<string, AIConversationLog> = new Map();
  private aiInstances: Map<string, any> = new Map();

  constructor() {
    this.conversations = new Map();
    this.aiInstances = new Map();
  }

  // Register an AI instance
  registerAI(name: string, aiInstance: any): void {
    this.aiInstances.set(name, aiInstance);
  }

  // Start a conversation between two AIs
  async startConversation(
    aiName1: string,
    aiName2: string,
    topic: string,
    initialPrompt: string
  ): Promise<AIConversationLog> {
    const conversationId = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const conversation: AIConversationLog = {
      id: conversationId,
      participants: [aiName1, aiName2],
      messages: [],
      createdAt: new Date(),
      topic,
    };

    const ai1 = this.aiInstances.get(aiName1);
    const ai2 = this.aiInstances.get(aiName2);

    if (!ai1 || !ai2) {
      throw new Error(`One or both AIs not registered: ${aiName1}, ${aiName2}`);
    }

    try {
      // Start conversation with initial prompt from AI1
      const ai1Response = await this.queryAI(ai1, initialPrompt);
      const message1: AIMessage = {
        id: `msg-1-${Date.now()}`,
        from: aiName1,
        to: aiName2,
        message: initialPrompt,
        response: ai1Response,
        timestamp: new Date(),
      };
      conversation.messages.push(message1);

      // AI2 responds
      const ai2Response = await this.queryAI(ai2, ai1Response);
      const message2: AIMessage = {
        id: `msg-2-${Date.now()}`,
        from: aiName2,
        to: aiName1,
        message: ai1Response,
        response: ai2Response,
        timestamp: new Date(),
      };
      conversation.messages.push(message2);

      // Store conversation
      this.conversations.set(conversationId, conversation);
      return conversation;
    } catch (error) {
      throw new Error(
        `Conversation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Continue an existing conversation
  async continueConversation(
    conversationId: string,
    nextPrompt: string
  ): Promise<AIMessage[]> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    const newMessages: AIMessage[] = [];
    const [ai1Name, ai2Name] = conversation.participants;
    const ai1 = this.aiInstances.get(ai1Name);
    const ai2 = this.aiInstances.get(ai2Name);

    try {
      // Prepare context from previous messages
      const context = conversation.messages
        .slice(-2)
        .map((m) => `${m.from}: ${m.response}`)
        .join('\n');

      // Get response from AI1
      const ai1Response = await this.queryAI(ai1, nextPrompt, context);
      const message1: AIMessage = {
        id: `msg-${conversation.messages.length + 1}`,
        from: ai1Name,
        to: ai2Name,
        message: nextPrompt,
        response: ai1Response,
        timestamp: new Date(),
        context,
      };
      newMessages.push(message1);
      conversation.messages.push(message1);

      // Get response from AI2
      const ai2Response = await this.queryAI(ai2, ai1Response, context);
      const message2: AIMessage = {
        id: `msg-${conversation.messages.length + 2}`,
        from: ai2Name,
        to: ai1Name,
        message: ai1Response,
        response: ai2Response,
        timestamp: new Date(),
        context,
      };
      newMessages.push(message2);
      conversation.messages.push(message2);

      return newMessages;
    } catch (error) {
      throw new Error(
        `Failed to continue conversation: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  // Query a single AI instance with timeout handling
  private async queryAI(ai: any, prompt: string, context?: string): Promise<string> {
    try {
      console.log('queryAI called with:', { prompt, context, aiType: typeof ai });
      
      // Set timeout for Ollama responses (180 seconds = 3 minutes for model inference)
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout after 180 seconds. Model may be slow or overloaded.')), 180000)
      );

      const queryPromise = (async () => {
        // Support different AI interface types
        if (ai.generateResponse) {
          console.log('Using generateResponse method');
          const result = await ai.generateResponse(prompt, context);
          console.log('generateResponse result:', result);
          return result.success ? result.response : 'Error: ' + (result.error || 'No response');
        } else if (ai.answer) {
          console.log('Using answer method');
          return ai.answer(prompt);
        } else if (ai.query) {
          console.log('Using query method');
          return ai.query(prompt);
        } else if (typeof ai === 'function') {
          console.log('Using function call');
          return await ai(prompt, context);
        } else {
          console.error('No recognized method found. AI object:', ai);
          throw new Error('AI instance does not have a recognized query method');
        }
      })();

      return await Promise.race([queryPromise, timeoutPromise]);
    } catch (error) {
      console.error('queryAI error:', error);
      return `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  // Get all conversations
  getConversations(): AIConversationLog[] {
    return Array.from(this.conversations.values());
  }

  // Get specific conversation
  getConversation(id: string): AIConversationLog | undefined {
    return this.conversations.get(id);
  }

  // Export conversation for training
  exportConversationForTraining(id: string): Array<{ prompt: string; response: string }> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error(`Conversation not found: ${id}`);
    }

    return conversation.messages.map((msg) => ({
      prompt: msg.message,
      response: msg.response || '',
    }));
  }

  // Analyze conversation for insights
  analyzeConversation(id: string): {
    totalMessages: number;
    averageResponseLength: number;
    participants: string[];
    duration: number;
    commonThemes: string[];
  } {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error(`Conversation not found: ${id}`);
    }

    const totalMessages = conversation.messages.length;
    const totalLength = conversation.messages.reduce((sum, msg) => sum + (msg.response?.length || 0), 0);
    const duration = conversation.messages[conversation.messages.length - 1].timestamp.getTime() - conversation.createdAt.getTime();

    return {
      totalMessages,
      averageResponseLength: totalMessages > 0 ? totalLength / totalMessages : 0,
      participants: conversation.participants,
      duration,
      commonThemes: [],
    };
  }

  // Clear a conversation
  deleteConversation(id: string): void {
    this.conversations.delete(id);
  }

  // Clear all conversations
  clearAllConversations(): void {
    this.conversations.clear();
  }
}

// Export singleton instance
export const aiMultiplexer = new AIMultiplexer();
