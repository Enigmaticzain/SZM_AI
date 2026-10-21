/**
 * Experiment Tracking System
 * Logs, stores, and compares all training runs
 */

export type ModelType = 'text' | 'vision' | 'physics' | 'rl' | 'llm';

export interface TrainingMetrics {
  accuracy?: number;
  loss?: number;
  f1?: number;
  precision?: number;
  recall?: number;
  perplexity?: number;
  [key: string]: number | undefined;
}

export interface ExperimentRun {
  id: string;
  timestamp: Date;
  name: string;
  description: string;
  modelType: ModelType;
  parameters: {
    learningRate?: number;
    epochs?: number;
    batchSize?: number;
    optimizer?: string;
    [key: string]: unknown;
  };
  dataInfo: {
    documentsCount: number;
    totalWords: number;
    avgDocLength: number;
    dataSize: number; // in bytes
  };
  metrics: TrainingMetrics;
  status: 'pending' | 'training' | 'complete' | 'failed';
  trainingTime: number; // in seconds
  notes: string;
  results: {
    successRate: number; // 0-100
    issuesFound: string[];
    improvements: string[];
  };
}

/**
 * Experiment tracking manager using localStorage
 */
export class ExperimentTracker {
  private storageKey = 'szm_experiments';

  /**
   * Create a new experiment run
   */
  createRun(options: Omit<ExperimentRun, 'id' | 'timestamp' | 'status' | 'trainingTime'>): ExperimentRun {
    const run: ExperimentRun = {
      ...options,
      id: this.generateId(),
      timestamp: new Date(),
      status: 'pending',
      trainingTime: 0,
    };

    this.saveRun(run);
    return run;
  }

  /**
   * Update experiment run with training progress
   */
  updateRun(id: string, updates: Partial<ExperimentRun>): ExperimentRun | null {
    const run = this.getRun(id);
    if (!run) return null;

    const updated: ExperimentRun = {
      ...run,
      ...updates,
    };

    this.saveRun(updated);
    return updated;
  }

  /**
   * Complete an experiment run with metrics
   */
  completeRun(id: string, metrics: TrainingMetrics, trainingTime: number, notes = ''): ExperimentRun | null {
    const run = this.getRun(id);
    if (!run) return null;

    const completed: ExperimentRun = {
      ...run,
      status: 'complete',
      metrics,
      trainingTime,
      notes,
      results: this.calculateResults(metrics),
    };

    this.saveRun(completed);
    return completed;
  }

  /**
   * Mark experiment as failed
   */
  failRun(id: string, error: string): ExperimentRun | null {
    const run = this.getRun(id);
    if (!run) return null;

    const failed: ExperimentRun = {
      ...run,
      status: 'failed',
      notes: error,
    };

    this.saveRun(failed);
    return failed;
  }

  /**
   * Get single experiment run
   */
  getRun(id: string): ExperimentRun | null {
    const runs = this.getAllRuns();
    return runs.find(r => r.id === id) || null;
  }

  /**
   * Get all experiment runs
   */
  getAllRuns(): ExperimentRun[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const runs = JSON.parse(data) as ExperimentRun[];
      return runs.map(r => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));
    } catch {
      console.error('Failed to load experiments');
      return [];
    }
  }

  /**
   * Get runs by model type
   */
  getRunsByType(modelType: ModelType): ExperimentRun[] {
    return this.getAllRuns().filter(r => r.modelType === modelType);
  }

  /**
   * Get recent runs
   */
  getRecentRuns(limit = 10): ExperimentRun[] {
    return this.getAllRuns()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get completed runs only
   */
  getCompletedRuns(): ExperimentRun[] {
    return this.getAllRuns().filter(r => r.status === 'complete');
  }

  /**
   * Get best run by metric
   */
  getBestRun(metricKey: keyof TrainingMetrics, modelType?: ModelType): ExperimentRun | null {
    let runs = this.getCompletedRuns();

    if (modelType) {
      runs = runs.filter(r => r.modelType === modelType);
    }

    if (runs.length === 0) return null;

    // For loss, lower is better; for others, higher is better
    const isLossMetric = metricKey === 'loss' || metricKey === 'perplexity';

    if (isLossMetric) {
      return runs.reduce((best, current) => {
        const bestValue = best.metrics[metricKey] ?? Infinity;
        const currentValue = current.metrics[metricKey] ?? Infinity;
        return currentValue < bestValue ? current : best;
      });
    } else {
      return runs.reduce((best, current) => {
        const bestValue = best.metrics[metricKey] ?? -Infinity;
        const currentValue = current.metrics[metricKey] ?? -Infinity;
        return currentValue > bestValue ? current : best;
      });
    }
  }

  /**
   * Compare two experiment runs
   */
  compareRuns(id1: string, id2: string): ComparisonResult | null {
    const run1 = this.getRun(id1);
    const run2 = this.getRun(id2);

    if (!run1 || !run2) return null;

    return {
      run1,
      run2,
      improvements: this.calculateImprovement(run1, run2),
      regressions: this.calculateRegression(run1, run2),
    };
  }

  /**
   * Get training trends
   */
  getTrends(modelType?: ModelType, limit = 30): TrendData[] {
    let runs = this.getCompletedRuns();

    if (modelType) {
      runs = runs.filter(r => r.modelType === modelType);
    }

    return runs
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-limit)
      .map(run => ({
        timestamp: run.timestamp,
        accuracy: run.metrics.accuracy || 0,
        loss: run.metrics.loss || 0,
        f1: run.metrics.f1 || 0,
      }));
  }

  /**
   * Delete experiment run
   */
  deleteRun(id: string): boolean {
    const runs = this.getAllRuns().filter(r => r.id !== id);
    this.saveAllRuns(runs);
    return true;
  }

  /**
   * Export all experiments as JSON
   */
  exportAsJson(): string {
    const runs = this.getAllRuns();
    return JSON.stringify(runs, null, 2);
  }

  /**
   * Export all experiments as CSV
   */
  exportAsCsv(): string {
    const runs = this.getCompletedRuns();
    if (runs.length === 0) return 'No experiments to export';

    const headers = ['ID', 'Name', 'Model Type', 'Accuracy', 'Loss', 'F1', 'Training Time (s)', 'Date'];
    const rows = runs.map(r => [
      r.id,
      r.name,
      r.modelType,
      r.metrics.accuracy?.toFixed(2) || 'N/A',
      r.metrics.loss?.toFixed(4) || 'N/A',
      r.metrics.f1?.toFixed(2) || 'N/A',
      r.trainingTime.toFixed(1),
      new Date(r.timestamp).toISOString(),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Get statistics
   */
  getStats(): ExperimentStats {
    const runs = this.getAllRuns();
    const completed = this.getCompletedRuns();

    return {
      totalRuns: runs.length,
      completedRuns: completed.length,
      failedRuns: runs.filter(r => r.status === 'failed').length,
      pendingRuns: runs.filter(r => r.status === 'pending' || r.status === 'training').length,
      avgTrainingTime: completed.length > 0 ? completed.reduce((sum, r) => sum + r.trainingTime, 0) / completed.length : 0,
      avgAccuracy: completed.length > 0 ? completed.reduce((sum, r) => sum + (r.metrics.accuracy || 0), 0) / completed.length : 0,
      bestAccuracy: this.getBestRun('accuracy')?.metrics.accuracy || 0,
    };
  }

  // Private helpers

  private saveRun(run: ExperimentRun): void {
    const runs = this.getAllRuns();
    const index = runs.findIndex(r => r.id === run.id);

    if (index >= 0) {
      runs[index] = run;
    } else {
      runs.push(run);
    }

    this.saveAllRuns(runs);
  }

  private saveAllRuns(runs: ExperimentRun[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(runs));
    } catch {
      console.error('Failed to save experiments');
    }
  }

  private generateId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateResults(metrics: TrainingMetrics): ExperimentRun['results'] {
    const issues: string[] = [];
    const improvements: string[] = [];

    if ((metrics.loss || 0) > 1) {
      issues.push('High loss value - model may not be training well');
    }

    if ((metrics.accuracy || 0) < 50) {
      issues.push('Low accuracy - consider more training or better data');
    }

    if ((metrics.accuracy || 0) > 90) {
      improvements.push('Excellent accuracy achieved!');
    }

    if ((metrics.loss || 0) < 0.1) {
      improvements.push('Loss is very low - model has learned well');
    }

    return {
      successRate: Math.min(100, (metrics.accuracy || 0) * 1),
      issuesFound: issues,
      improvements,
    };
  }

  private calculateImprovement(run1: ExperimentRun, run2: ExperimentRun): string[] {
    const improvements: string[] = [];

    if ((run2.metrics.accuracy || 0) > (run1.metrics.accuracy || 0)) {
      const diff = ((run2.metrics.accuracy || 0) - (run1.metrics.accuracy || 0)).toFixed(2);
      improvements.push(`Accuracy improved by ${diff}%`);
    }

    if ((run2.metrics.loss || 0) < (run1.metrics.loss || 0)) {
      const diff = ((run1.metrics.loss || 0) - (run2.metrics.loss || 0)).toFixed(4);
      improvements.push(`Loss reduced by ${diff}`);
    }

    return improvements;
  }

  private calculateRegression(run1: ExperimentRun, run2: ExperimentRun): string[] {
    const regressions: string[] = [];

    if ((run2.metrics.accuracy || 0) < (run1.metrics.accuracy || 0)) {
      const diff = ((run1.metrics.accuracy || 0) - (run2.metrics.accuracy || 0)).toFixed(2);
      regressions.push(`Accuracy decreased by ${diff}%`);
    }

    if ((run2.metrics.loss || 0) > (run1.metrics.loss || 0)) {
      const diff = ((run2.metrics.loss || 0) - (run1.metrics.loss || 0)).toFixed(4);
      regressions.push(`Loss increased by ${diff}`);
    }

    return regressions;
  }
}

export interface ComparisonResult {
  run1: ExperimentRun;
  run2: ExperimentRun;
  improvements: string[];
  regressions: string[];
}

export interface TrendData {
  timestamp: Date;
  accuracy: number;
  loss: number;
  f1: number;
}

export interface ExperimentStats {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  pendingRuns: number;
  avgTrainingTime: number;
  avgAccuracy: number;
  bestAccuracy: number;
}

// Global instance
export const experimentTracker = new ExperimentTracker();
