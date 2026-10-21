interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
  context?: number[];
}

interface OllamaTrainingData {
  prompt: string;
  response: string;
  context?: string;
}

export class OllamaIntegration {
  private baseUrl: string;
  private currentModel: string;

  constructor(baseUrl: string = '/api/ollama', model: string = 'qwen2.5-coder:1.5b-base') {
    this.baseUrl = baseUrl;
    this.currentModel = model;
  }

  async checkConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Checking Ollama connection at:', `${this.baseUrl}/tags`);
      const response = await fetch(`${this.baseUrl}/tags`);
      if (!response.ok) {
        throw new Error(`Ollama not responding: ${response.status}`);
      }
      console.log('Ollama connection successful');
      return { success: true };
    } catch (error) {
      console.error('Ollama connection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async getAvailableModels(): Promise<{ success: boolean; models: OllamaModel[]; error?: string }> {
    try {
      console.log('Fetching Ollama models from:', `${this.baseUrl}/tags`);
      const response = await fetch(`${this.baseUrl}/tags`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      console.log('Ollama models:', data.models);
      return {
        success: true,
        models: data.models || [],
      };
    } catch (error) {
      console.error('Ollama models error:', error);
      return {
        success: false,
        models: [],
        error: error instanceof Error ? error.message : 'Failed to get models',
      };
    }
  }

  async generateResponse(prompt: string, context?: string): Promise<{ success: boolean; response: string; error?: string }> {
    try {
      const fullPrompt = context ? `Context: ${context}\n\nQuestion: ${prompt}` : prompt;

      console.log('Calling Ollama generateResponse at:', `${this.baseUrl}/generate`);
      console.log('Model:', this.currentModel);
      console.log('Prompt:', prompt);

      // First check if Ollama is reachable
      const connCheck = await this.checkConnection();
      if (!connCheck.success) {
        console.error('Ollama not reachable:', connCheck.error);
        return {
          success: false,
          response: '',
          error: `Ollama not reachable: ${connCheck.error}`,
        };
      }

      // Create abort controller for 180-second timeout (3 minutes for model inference)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000);

      try {
        console.log('Sending request to Ollama...');
        const response = await fetch(`${this.baseUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.currentModel,
            prompt: fullPrompt,
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        console.log('Ollama response status:', response.status);

        if (!response.ok) {
          const text = await response.text();
          console.error('Ollama error response:', text);
          throw new Error(`Generation failed: ${response.status} - ${text}`);
        }

        const data: OllamaResponse = await response.json();
        console.log('Ollama response received:', data.response.substring(0, 100) + '...');
        return {
          success: true,
          response: data.response,
        };
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      console.error('Ollama generation error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          response: '',
          error: 'Ollama inference timeout (took more than 180 seconds). Model may be busy or response too long.',
        };
      }
      return {
        success: false,
        response: '',
        error: error instanceof Error ? error.message : 'Generation failed',
      };
    }
  }

  async trainWithData(trainingData: OllamaTrainingData[]): Promise<{ success: boolean; error?: string }> {
    try {
      // Note: Ollama doesn't support direct fine-tuning via API
      // This is a simulation of training by creating a context-aware prompt
      const trainingPrompt = trainingData
        .map(data => `Q: ${data.prompt}\nA: ${data.response}`)
        .join('\n\n');

      // Store training context for future use
      localStorage.setItem('ollama-training-context', trainingPrompt);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Training failed',
      };
    }
  }

  async pullModel(modelName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Model pull failed',
      };
    }
  }

  setModel(modelName: string): void {
    this.currentModel = modelName;
  }

  getTrainingContext(): string {
    return localStorage.getItem('ollama-training-context') || '';
  }
}