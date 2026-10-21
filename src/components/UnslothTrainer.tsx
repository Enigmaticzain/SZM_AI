import { useState, useEffect, useRef } from 'react';
import { Play, Square, Download, Settings, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { UnslothIntegration } from '@/utils/unslothIntegration';
import { TrainingData } from '@/utils/localLanguageModel';

interface UnslothTrainerProps {
  trainingHistory: TrainingData[];
}

export default function UnslothTrainer({ trainingHistory }: UnslothTrainerProps) {
  const [unsloth] = useState(() => new UnslothIntegration());
  const [isConnected, setIsConnected] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('unsloth/llama-2-7b-bnb-4bit');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [trainingStatus, setTrainingStatus] = useState(unsloth.getCurrentStatus());
  const [config, setConfig] = useState({
    max_seq_length: 2048,
    learning_rate: 2e-4,
    num_train_epochs: 1,
    per_device_train_batch_size: 2,
    gradient_accumulation_steps: 4,
    warmup_steps: 5,
    max_steps: 60,
    logging_steps: 1,
    save_steps: 20,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const statusInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkConnection();
    return () => {
      if (statusInterval.current) {
        clearInterval(statusInterval.current);
      }
    };
  }, []);

  const checkConnection = async () => {
    const result = await unsloth.checkUnslothServer();
    setIsConnected(result.success);
    
    if (result.success) {
      const modelsResult = await unsloth.getAvailableModels();
      if (modelsResult.success) {
        setAvailableModels(modelsResult.models);
        if (modelsResult.models.length > 0) {
          setSelectedModel(modelsResult.models[0]);
        }
      }
      addLog('✓ Connected to Unsloth server');
    } else {
      addLog(`✗ Connection failed: ${result.error}`);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const startTraining = async () => {
    if (trainingHistory.length === 0) {
      addLog('✗ No training data available');
      return;
    }

    setIsTraining(true);
    addLog('🚀 Starting Unsloth training...');

    try {
      // Convert SZM training data to Unsloth format
      const unslothData = unsloth.convertToUnslothFormat(trainingHistory);
      addLog(`📊 Converted ${unslothData.length} training examples`);

      // Prepare dataset
      const datasetResult = await unsloth.prepareTrainingData(unslothData);
      if (!datasetResult.success) {
        throw new Error(datasetResult.error);
      }
      addLog(`✓ Dataset prepared: ${datasetResult.dataset_id}`);

      // Start training
      const trainingConfig = {
        model_name: selectedModel,
        dtype: 'float16',
        load_in_4bit: true,
        output_dir: './unsloth_outputs',
        ...config,
      };

      const trainingResult = await unsloth.startTraining(trainingConfig, datasetResult.dataset_id!);
      if (!trainingResult.success) {
        throw new Error(trainingResult.error);
      }

      setTrainingId(trainingResult.training_id!);
      addLog(`✓ Training started: ${trainingResult.training_id}`);

      // Start status monitoring
      statusInterval.current = setInterval(async () => {
        if (trainingResult.training_id) {
          const statusResult = await unsloth.getTrainingStatus(trainingResult.training_id);
          if (statusResult.success && statusResult.status) {
            setTrainingStatus(statusResult.status);
            
            if (statusResult.status.status === 'completed') {
              setIsTraining(false);
              addLog('🎉 Training completed successfully!');
              if (statusInterval.current) {
                clearInterval(statusInterval.current);
              }
            } else if (statusResult.status.status === 'error') {
              setIsTraining(false);
              addLog(`✗ Training failed: ${statusResult.status.error}`);
              if (statusInterval.current) {
                clearInterval(statusInterval.current);
              }
            }
          }
        }
      }, 2000);

    } catch (error) {
      setIsTraining(false);
      addLog(`✗ Training error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const stopTraining = async () => {
    if (trainingId) {
      const result = await unsloth.stopTraining(trainingId);
      if (result.success) {
        setIsTraining(false);
        setTrainingId(null);
        addLog('⏹️ Training stopped');
        if (statusInterval.current) {
          clearInterval(statusInterval.current);
        }
      } else {
        addLog(`✗ Failed to stop training: ${result.error}`);
      }
    }
  };

  const exportModel = async (format: 'gguf' | 'safetensors' | 'pytorch') => {
    if (!trainingId) {
      addLog('✗ No training session to export');
      return;
    }

    addLog(`📦 Exporting model as ${format}...`);
    const result = await unsloth.exportModel(trainingId, format);
    
    if (result.success && result.download_url) {
      addLog(`✓ Model exported: ${result.download_url}`);
      // Trigger download
      const link = document.createElement('a');
      link.href = result.download_url;
      link.download = `szm-model.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      addLog(`✗ Export failed: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <h3 className="text-lg font-semibold text-slate-900">Unsloth Training Server</h3>
          </div>
          <button
            onClick={checkConnection}
            className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
          >
            Reconnect
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {isConnected 
            ? `Connected to Unsloth server. ${availableModels.length} models available.`
            : 'Not connected. Make sure Unsloth server is running on localhost:8000'
          }
        </p>
      </div>

      {/* Training Configuration */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Settings className="h-5 w-5 text-blue-600" />
          Training Configuration
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Base Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isTraining}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
              <option value="unsloth/llama-2-7b-bnb-4bit">Llama 2 7B (4-bit)</option>
              <option value="unsloth/mistral-7b-bnb-4bit">Mistral 7B (4-bit)</option>
              <option value="unsloth/codellama-7b-bnb-4bit">CodeLlama 7B (4-bit)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Learning Rate</label>
            <input
              type="number"
              value={config.learning_rate}
              onChange={(e) => setConfig(prev => ({ ...prev, learning_rate: parseFloat(e.target.value) }))}
              disabled={isTraining}
              step="0.0001"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Epochs</label>
            <input
              type="number"
              value={config.num_train_epochs}
              onChange={(e) => setConfig(prev => ({ ...prev, num_train_epochs: parseInt(e.target.value) }))}
              disabled={isTraining}
              min="1"
              max="10"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Batch Size</label>
            <input
              type="number"
              value={config.per_device_train_batch_size}
              onChange={(e) => setConfig(prev => ({ ...prev, per_device_train_batch_size: parseInt(e.target.value) }))}
              disabled={isTraining}
              min="1"
              max="8"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Max Steps</label>
            <input
              type="number"
              value={config.max_steps}
              onChange={(e) => setConfig(prev => ({ ...prev, max_steps: parseInt(e.target.value) }))}
              disabled={isTraining}
              min="10"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Sequence Length</label>
            <input
              type="number"
              value={config.max_seq_length}
              onChange={(e) => setConfig(prev => ({ ...prev, max_seq_length: parseInt(e.target.value) }))}
              disabled={isTraining}
              step="512"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      {/* Training Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Training Control</h3>
            <p className="text-sm text-slate-600">
              {trainingHistory.length} training examples ready • {isConnected ? 'Server ready' : 'Server offline'}
            </p>
          </div>

          <div className="flex gap-2">
            {!isTraining ? (
              <button
                onClick={startTraining}
                disabled={!isConnected || trainingHistory.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-slate-300"
              >
                <Play className="h-4 w-4" />
                Start Training
              </button>
            ) : (
              <button
                onClick={stopTraining}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <Square className="h-4 w-4" />
                Stop Training
              </button>
            )}
          </div>
        </div>

        {/* Training Progress */}
        {isTraining && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progress: {trainingStatus.current_step}/{trainingStatus.total_steps}</span>
              <span>Loss: {trainingStatus.loss.toFixed(4)}</span>
              <span>ETA: {trainingStatus.eta}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200">
              <div 
                className="h-2 rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${trainingStatus.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      {trainingStatus.status === 'completed' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Download className="h-5 w-5 text-purple-600" />
            Export Trained Model
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => exportModel('gguf')}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              <Download className="h-4 w-4" />
              Export GGUF
            </button>
            <button
              onClick={() => exportModel('safetensors')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Export SafeTensors
            </button>
            <button
              onClick={() => exportModel('pytorch')}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              <Download className="h-4 w-4" />
              Export PyTorch
            </button>
          </div>
        </div>
      )}

      {/* Training Logs */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Zap className="h-5 w-5 text-yellow-600" />
          Training Logs
        </h3>

        <div className="h-64 overflow-y-auto rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100">
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-500">
              No logs yet. Start training to see progress.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}