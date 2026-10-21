// Learning Engine - Extracts and processes knowledge from search results

export interface LearnedKnowledge {
  id: string;
  source: string;
  content: string;
  category?: string;
  keywords: string[];
  confidence: number;
  learnedAt: Date;
  processed: boolean;
}

export interface ExtractionResult {
  mainConcepts: string[];
  keyPoints: string[];
  entities: string[];
  summary: string;
}

export class LearningEngine {
  private knowledgeBase: Map<string, LearnedKnowledge> = new Map();
  private localStorage: boolean;

  constructor(enableStorage: boolean = true) {
    this.localStorage = enableStorage;
    this.loadFromStorage();
  }

  // Extract knowledge from text content
  extractKnowledge(text: string): ExtractionResult {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    // Extract main concepts (typically in first 3 sentences)
    const mainConcepts = this.extractConcepts(sentences.slice(0, 3).join(' '));
    
    // Extract key points (sentences with keywords)
    const keyPoints = sentences
      .filter((s) => this.containsKeywords(s))
      .slice(0, 5)
      .map((s) => s.trim());
    
    // Extract entities (nouns, proper nouns)
    const entities = this.extractEntities(text);
    
    // Create summary
    const summary = this.createSummary(sentences);

    return {
      mainConcepts,
      keyPoints,
      entities,
      summary,
    };
  }

  // Add learned knowledge
  async addKnowledge(
    source: string,
    content: string,
    category?: string
  ): Promise<LearnedKnowledge> {
    const extraction = this.extractKnowledge(content);
    
    const knowledge: LearnedKnowledge = {
      id: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source,
      content,
      category,
      keywords: extraction.mainConcepts,
      confidence: 0.8,
      learnedAt: new Date(),
      processed: true,
    };

    this.knowledgeBase.set(knowledge.id, knowledge);
    
    if (this.localStorage) {
      this.saveToStorage();
    }

    return knowledge;
  }

  // Retrieve related knowledge
  getRelatedKnowledge(query: string, limit: number = 5): LearnedKnowledge[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    const scored = Array.from(this.knowledgeBase.values()).map((knowledge) => {
      const matches = queryTerms.filter((term) =>
        knowledge.keywords.some((kw) => kw.toLowerCase().includes(term))
      );
      return {
        knowledge,
        score: matches.length,
      };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.knowledge);
  }

  // Get all learned knowledge
  getAllKnowledge(): LearnedKnowledge[] {
    return Array.from(this.knowledgeBase.values());
  }

  // Search in learned knowledge
  search(query: string): LearnedKnowledge[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.knowledgeBase.values()).filter(
      (knowledge) =>
        knowledge.content.toLowerCase().includes(lowerQuery) ||
        knowledge.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
    );
  }

  // Delete learned knowledge
  deleteKnowledge(id: string): void {
    this.knowledgeBase.delete(id);
    if (this.localStorage) {
      this.saveToStorage();
    }
  }

  // Clear all knowledge
  clearAll(): void {
    this.knowledgeBase.clear();
    if (this.localStorage) {
      localStorage.removeItem('szm-learned-knowledge');
    }
  }

  // Get statistics
  getStats(): {
    totalItems: number;
    byCategory: Record<string, number>;
    totalKeywords: number;
    averageConfidence: number;
  } {
    const items = Array.from(this.knowledgeBase.values());
    const byCategory: Record<string, number> = {};
    let totalConfidence = 0;
    let totalKeywords = 0;

    items.forEach((item) => {
      if (item.category) {
        byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      }
      totalConfidence += item.confidence;
      totalKeywords += item.keywords.length;
    });

    return {
      totalItems: items.length,
      byCategory,
      totalKeywords,
      averageConfidence: items.length > 0 ? totalConfidence / items.length : 0,
    };
  }

  // Private helper methods
  private extractConcepts(text: string): string[] {
    const words = text.split(/\s+/);
    const concepts: string[] = [];
    
    for (let i = 0; i < Math.min(words.length, 10); i++) {
      const word = words[i].replace(/[^a-zA-Z0-9-]/g, '');
      if (word.length > 3 && !this.isStopword(word)) {
        concepts.push(word);
      }
    }
    
    return [...new Set(concepts)];
  }

  private extractEntities(text: string): string[] {
    const words = text.split(/\s+/);
    const entities: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      // Look for capitalized words as potential entities
      if (word[0] === word[0].toUpperCase() && word.length > 3) {
        const cleaned = word.replace(/[^a-zA-Z0-9-]/g, '');
        if (cleaned.length > 2) {
          entities.push(cleaned);
        }
      }
    }
    
    return [...new Set(entities)].slice(0, 10);
  }

  private containsKeywords(sentence: string): boolean {
    const keywords = [
      'important',
      'key',
      'main',
      'significant',
      'essential',
      'critical',
      'must',
      'should',
      'note',
      'however',
      'therefore',
      'because',
      'result',
      'effect',
    ];
    
    return keywords.some((kw) => sentence.toLowerCase().includes(kw));
  }

  private createSummary(sentences: string[]): string {
    if (sentences.length === 0) return '';
    
    const summaryLength = Math.min(2, sentences.length);
    return sentences
      .slice(0, summaryLength)
      .map((s) => s.trim())
      .join(' ');
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
    ];
    return stopwords.includes(word.toLowerCase());
  }

  // Storage helpers
  private saveToStorage(): void {
    try {
      const data = Array.from(this.knowledgeBase.values());
      localStorage.setItem('szm-learned-knowledge', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save learned knowledge:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('szm-learned-knowledge');
      if (data) {
        const items = JSON.parse(data) as LearnedKnowledge[];
        items.forEach((item) => {
          item.learnedAt = new Date(item.learnedAt);
          this.knowledgeBase.set(item.id, item);
        });
      }
    } catch (error) {
      console.error('Failed to load learned knowledge:', error);
    }
  }

  // Export for backup
  exportJSON(): string {
    const data = Array.from(this.knowledgeBase.values());
    return JSON.stringify(data, null, 2);
  }

  // Import from backup
  importJSON(jsonStr: string): number {
    try {
      const items = JSON.parse(jsonStr) as LearnedKnowledge[];
      let imported = 0;
      
      items.forEach((item) => {
        item.learnedAt = new Date(item.learnedAt);
        this.knowledgeBase.set(item.id, item);
        imported++;
      });
      
      if (this.localStorage) {
        this.saveToStorage();
      }
      
      return imported;
    } catch (error) {
      throw new Error(
        `Failed to import knowledge: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

// Export singleton instance
export const learningEngine = new LearningEngine();
