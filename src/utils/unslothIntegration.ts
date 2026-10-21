interface UnslothTrainingConfig {
  model_name: string;
  max_seq_length: number;
  dtype: string;
  load_in_4bit: boolean;
  learning_rate: number;
  num_train_epochs: number;
  per_device_train_batch_size: number;
  gradient_accumulation_steps: number;
  warmup_steps: number;
  max_steps: number;
  logging_steps: number;
  save_steps: number;
  output_dir: string;
}

interface UnslothTrainingData {
  instruction: string;
  input: string;
  output: string;
}

interface UnslothTrainingStatus {
  status: 'idle' | 'preparing' | 'training' | 'completed' | 'error';
  progress: number;
  current_step: number;
  total_steps: number;
  loss: number;
  eta: string;
  error?: string;
}

export class UnslothIntegration {
  private baseUrl: string;
  private trainingStatus: UnslothTrainingStatus;

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl;
    this.trainingStatus = {
      status: 'idle',
      progress: 0,
      current_step: 0,
      total_steps: 0,
      loss: 0,
      eta: '00:00:00'
    };
  }

  async checkUnslothServer(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`Unsloth server not responding: ${response.status}`);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async getAvailableModels(): Promise<{ success: boolean; models: string[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/models`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        models: data.models || [],
      };
    } catch (error) {
      return {
        success: false,
        models: [],
        error: error instanceof Error ? error.message : 'Failed to get models',
      };
    }
  }

  async prepareTrainingData(data: UnslothTrainingData[]): Promise<{ success: boolean; dataset_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/prepare-dataset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data,
          format: 'alpaca'
        }),
      });

      if (!response.ok) {
        throw new Error(`Dataset preparation failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        dataset_id: result.dataset_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Dataset preparation failed',
      };
    }
  }

  async startTraining(config: UnslothTrainingConfig, dataset_id: string): Promise<{ success: boolean; training_id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/start-training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: config,
          dataset_id: dataset_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Training start failed: ${response.status}`);
      }

      const result = await response.json();
      this.trainingStatus.status = 'training';
      
      return {
        success: true,
        training_id: result.training_id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Training start failed',
      };
    }
  }

  async getTrainingStatus(training_id: string): Promise<{ success: boolean; status?: UnslothTrainingStatus; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/training-status/${training_id}`);
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const status = await response.json();
      this.trainingStatus = status;
      
      return {
        success: true,
        status: status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed',
      };
    }
  }

  async stopTraining(training_id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/stop-training/${training_id}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Training stop failed: ${response.status}`);
      }

      this.trainingStatus.status = 'idle';
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Training stop failed',
      };
    }
  }

  async exportModel(training_id: string, format: 'gguf' | 'safetensors' | 'pytorch'): Promise<{ success: boolean; download_url?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/export-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          training_id: training_id,
          format: format,
        }),
      });

      if (!response.ok) {
        throw new Error(`Model export failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        download_url: result.download_url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Model export failed',
      };
    }
  }

  getCurrentStatus(): UnslothTrainingStatus {
    return this.trainingStatus;
  }

  // Convert SZM training data to Unsloth format
  convertToUnslothFormat(szmData: any[]): UnslothTrainingData[] {
    return szmData.map(item => ({
      instruction: this.extractInstruction(item),
      input: this.extractInput(item),
      output: this.extractOutput(item),
    }));
  }

  private extractInstruction(item: any): string {
    // Extract meaningful instruction from SZM training data
    if (item.fileName) {
      return `Learn from the content of ${item.fileName}`;
    }
    if (item.extractedText && item.extractedText.length > 100) {
      const firstLine = item.extractedText.split('\n')[0];
      return `Understand and learn from: ${firstLine.substring(0, 100)}...`;
    }
    return 'Learn from the provided content';
  }

  private extractInput(item: any): string {
    // Use context or metadata as input
    const context = [];
    if (item.fileName) context.push(`File: ${item.fileName}`);
    if (item.mimeType) context.push(`Type: ${item.mimeType}`);
    if (item.wordCount) context.push(`Words: ${item.wordCount}`);
    
    return context.join(', ') || '';
  }

  private extractOutput(item: any): string {
    // Use the actual content as expected output
    return item.extractedText || item.content || 'No content available';
  }
}