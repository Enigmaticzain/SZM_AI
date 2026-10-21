// Memory System - Persistent training memory that learns from all interactions

export interface MemoryEntry {
  id: string;
  type: 'question' | 'answer' | 'web-search' | 'ai-conversation' | 'skill' | 'interaction';
  content: string;
  source?: string;
  confidence: number;
  relevantTerms: string[];
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  rating?: 'positive' | 'negative' | 'neutral';
}

export interface MemorySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  totalInteractions: number;
  topics: string[];
  aiSourcesUsed: string[];
}

export class MemorySystem {
  private memories: Map<string, MemoryEntry> = new Map();
  private sessions: Map<string, MemorySession> = new Map();
  private currentSession: MemorySession | null = null;
  private localStorage: boolean;

  constructor(enableStorage: boolean = true) {
    this.localStorage = enableStorage;
    this.loadFromStorage();
  }

  // Start a new session
  startSession(): MemorySession {
    const session: MemorySession = {
      id: `session-${Date.now()}`,
      startTime: new Date(),
      totalInteractions: 0,
      topics: [],
      aiSourcesUsed: [],
    };
    
    this.currentSession = session;
    this.sessions.set(session.id, session);
    
    return session;
  }

  // End current session
  endSession(): MemorySession | null {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      if (this.localStorage) {
        this.saveToStorage();
      }
      const ended = this.currentSession;
      this.currentSession = null;
      return ended;
    }
    return null;
  }

  // Record a memory entry
  async recordMemory(
    type: MemoryEntry['type'],
    content: string,
    source?: string
  ): Promise<MemoryEntry> {
    const entry: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      content,
      source,
      confidence: 0.85,
      relevantTerms: this.extractTerms(content),
      createdAt: new Date(),
      updatedAt: new Date(),
      accessCount: 0,
    };

    this.memories.set(entry.id, entry);

    // Update current session if active
    if (this.currentSession) {
      this.currentSession.totalInteractions++;
      if (source && !this.currentSession.aiSourcesUsed.includes(source)) {
        this.currentSession.aiSourcesUsed.push(source);
      }
    }

    if (this.localStorage) {
      this.saveToStorage();
    }

    return entry;
  }

  // Recall memories related to a query
  recallMemories(query: string, limit: number = 10): MemoryEntry[] {
    const queryTerms = this.extractTerms(query);
    
    const scored = Array.from(this.memories.values()).map((memory) => {
      const commonTerms = memory.relevantTerms.filter((term) =>
        queryTerms.some((qterm) => qterm.includes(term) || term.includes(qterm))
      );
      
      return {
        memory,
        score: commonTerms.length * memory.confidence * (memory.accessCount + 1),
      };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => {
        item.memory.accessCount++;
        return item.memory;
      });
  }

  // Rate a memory entry
  rateMemory(id: string, rating: 'positive' | 'negative' | 'neutral'): void {
    const memory = this.memories.get(id);
    if (memory) {
      memory.rating = rating;
      memory.updatedAt = new Date();
      
      // Adjust confidence based on rating
      if (rating === 'positive') {
        memory.confidence = Math.min(1, memory.confidence + 0.1);
      } else if (rating === 'negative') {
        memory.confidence = Math.max(0, memory.confidence - 0.1);
      }

      if (this.localStorage) {
        this.saveToStorage();
      }
    }
  }

  // Search memories
  searchMemories(query: string): MemoryEntry[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.memories.values())
      .filter(
        (memory) =>
          memory.content.toLowerCase().includes(lowerQuery) ||
          memory.relevantTerms.some((term) => term.toLowerCase().includes(lowerQuery))
      )
      .sort((a, b) => b.accessCount - a.accessCount);
  }

  // Get memories by type
  getMemoriesByType(type: MemoryEntry['type']): MemoryEntry[] {
    return Array.from(this.memories.values()).filter((m) => m.type === type);
  }

  // Get memories by source
  getMemoriesBySource(source: string): MemoryEntry[] {
    return Array.from(this.memories.values()).filter((m) => m.source === source);
  }

  // Get all memories
  getAllMemories(): MemoryEntry[] {
    return Array.from(this.memories.values());
  }

  // Get memory statistics
  getStats(): {
    totalMemories: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
    totalSessions: number;
    averageConfidence: number;
    topicsDiscussed: string[];
  } {
    const memories = Array.from(this.memories.values());
    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let totalConfidence = 0;
    const allTopics = new Set<string>();

    memories.forEach((memory) => {
      byType[memory.type] = (byType[memory.type] || 0) + 1;
      if (memory.source) {
        bySource[memory.source] = (bySource[memory.source] || 0) + 1;
      }
      totalConfidence += memory.confidence;
      memory.relevantTerms.forEach((term) => allTopics.add(term));
    });

    // Add session topics
    Array.from(this.sessions.values()).forEach((session) => {
      session.topics.forEach((topic) => allTopics.add(topic));
    });

    return {
      totalMemories: memories.length,
      byType,
      bySource,
      totalSessions: this.sessions.size,
      averageConfidence: memories.length > 0 ? totalConfidence / memories.length : 0,
      topicsDiscussed: Array.from(allTopics),
    };
  }

  // Delete a memory
  deleteMemory(id: string): void {
    this.memories.delete(id);
    if (this.localStorage) {
      this.saveToStorage();
    }
  }

  // Clear old memories (older than specified days)
  cleanupOldMemories(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    Array.from(this.memories.values()).forEach((memory) => {
      if (memory.createdAt < cutoffDate) {
        this.memories.delete(memory.id);
        deletedCount++;
      }
    });

    if (this.localStorage && deletedCount > 0) {
      this.saveToStorage();
    }

    return deletedCount;
  }

  // Get session details
  getSession(id: string): MemorySession | undefined {
    return this.sessions.get(id);
  }

  // Get all sessions
  getAllSessions(): MemorySession[] {
    return Array.from(this.sessions.values());
  }

  // Private helper methods
  private extractTerms(text: string): string[] {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !this.isStopword(word));
    
    return [...new Set(words)].slice(0, 20);
  }

  private isStopword(word: string): boolean {
    const stopwords = [
      'the',
      'is',
      'at',
      'which',
      'on',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'from',
      'to',
      'for',
      'of',
      'by',
      'with',
      'this',
      'that',
      'what',
      'how',
      'why',
    ];
    return stopwords.includes(word);
  }

  private saveToStorage(): void {
    try {
      const data = {
        memories: Array.from(this.memories.values()),
        sessions: Array.from(this.sessions.values()),
      };
      localStorage.setItem('szm-memory-system', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save memory:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('szm-memory-system');
      if (data) {
        const parsed = JSON.parse(data);
        
        if (parsed.memories) {
          parsed.memories.forEach((memory: MemoryEntry) => {
            memory.createdAt = new Date(memory.createdAt);
            memory.updatedAt = new Date(memory.updatedAt);
            this.memories.set(memory.id, memory);
          });
        }

        if (parsed.sessions) {
          parsed.sessions.forEach((session: MemorySession) => {
            session.startTime = new Date(session.startTime);
            if (session.endTime) {
              session.endTime = new Date(session.endTime);
            }
            this.sessions.set(session.id, session);
          });
        }
      }
    } catch (error) {
      console.error('Failed to load memory:', error);
    }
  }

  // Export for backup
  exportJSON(): string {
    const data = {
      memories: Array.from(this.memories.values()),
      sessions: Array.from(this.sessions.values()),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  // Import from backup
  importJSON(jsonStr: string): { memories: number; sessions: number } {
    try {
      const data = JSON.parse(jsonStr);
      let memoryCount = 0;
      let sessionCount = 0;

      if (data.memories) {
        data.memories.forEach((memory: MemoryEntry) => {
          memory.createdAt = new Date(memory.createdAt);
          memory.updatedAt = new Date(memory.updatedAt);
          this.memories.set(memory.id, memory);
          memoryCount++;
        });
      }

      if (data.sessions) {
        data.sessions.forEach((session: MemorySession) => {
          session.startTime = new Date(session.startTime);
          if (session.endTime) {
            session.endTime = new Date(session.endTime);
          }
          this.sessions.set(session.id, session);
          sessionCount++;
        });
      }

      if (this.localStorage) {
        this.saveToStorage();
      }

      return { memories: memoryCount, sessions: sessionCount };
    } catch (error) {
      throw new Error(
        `Failed to import memory: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Clear everything
  clearAll(): void {
    this.memories.clear();
    this.sessions.clear();
    this.currentSession = null;
    if (this.localStorage) {
      localStorage.removeItem('szm-memory-system');
    }
  }
}

// Export singleton instance
export const memorySystem = new MemorySystem();
