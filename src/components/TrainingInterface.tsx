import { useRef, useState } from 'react';
import { FolderOpen, FileText, Upload, Volume2, Image as ImageIcon, GitBranch, Zap } from 'lucide-react';
import { createTrainingEntry, TrainingData, TrainingDataType } from '@/utils/localLanguageModel';
import { extractTextFromPdf } from '@/utils/pdfExtractor';
import GitHubSkillsImporter from './GitHubSkillsImporter';
import UnslothTrainer from './UnslothTrainer';

interface TrainingInterfaceProps {
  onTrain: (data: TrainingData) => void;
  onClearTraining: () => void;
  trainingHistory: TrainingData[];
}

const TEXT_FILE_EXTENSIONS = new Set([
  'txt',
  'md',
  'json',
  'csv',
  'log',
  'ini',
  'yaml',
  'yml',
  'xml',
  'js',
  'jsx',
  'ts',
  'tsx',
  'py',
  'c',
  'cpp',
  'h',
  'hpp',
]);

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function getTrainingTypeFromFile(file: File): TrainingDataType {
  const ext = getFileExtension(file.name);
  
  // Explicit PDF detection
  if (file.type === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  
  if (file.type.startsWith('text/') || TEXT_FILE_EXTENSIONS.has(ext)) {
    return 'text';
  }

  if (file.type.startsWith('image/')) {
    return 'image';
  }

  if (file.type.startsWith('video/')) {
    return 'video';
  }

  if (file.type.startsWith('audio/')) {
    return 'audio';
  }

  return 'pdf';
}

function getTrainingTypeFromMimeType(mimeType: string): TrainingDataType {
  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    return 'text';
  }

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }

  return 'pdf';
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(String(event.target?.result ?? ''));
    };

    reader.onerror = () => {
      reject(new Error(`Unable to read ${file.name}`));
    };

    reader.readAsText(file);
  });
}

function buildBinaryMetadata(file: File) {
  return [
    `File: ${file.name}`,
    `Type: ${file.type || 'unknown'}`,
    `Size: ${(file.size / 1024).toFixed(2)} KB`,
    'Note: text extraction is strongest with TXT, MD, JSON, CSV, XML, and code files.',
  ].join('\n');
}

export default function TrainingInterface({
  onTrain,
  onClearTraining,
  trainingHistory,
}: TrainingInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'files' | 'github' | 'unsloth'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDesktop = Boolean(window.desktop?.isDesktop);

  const handleTextTrain = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to train the local model.');
      return;
    }

    setIsTraining(true);

    window.setTimeout(() => {
      onTrain(
        createTrainingEntry({
          type: 'text',
          content: inputText,
        })
      );
      setInputText('');
      setIsTraining(false);
    }, 450);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setIsTraining(true);

    try {
      const entries = await Promise.all(
        files.map(async (file) => {
          const type = getTrainingTypeFromFile(file);
          let content = '';

          // Handle PDF files
          if (type === 'pdf') {
            try {
              console.log(`Extracting text from PDF: ${file.name}`);
              content = await extractTextFromPdf(file);
              console.log(`Successfully extracted ${content.length} characters from ${file.name}`);
            } catch (error) {
              console.error(`PDF extraction error for ${file.name}:`, error);
              content = buildBinaryMetadata(file);
            }
          } else if (type === 'text') {
            // Handle text files
            try {
              console.log(`Reading text file: ${file.name}`);
              content = await readFileAsText(file);
              console.log(`Successfully read ${content.length} characters from ${file.name}`);
            } catch (error) {
              console.error(`Text file read error for ${file.name}:`, error);
              content = buildBinaryMetadata(file);
            }
          } else {
            // Handle other binary types (images, video, audio)
            console.log(`Processing ${type} file: ${file.name}`);
            content = buildBinaryMetadata(file);
          }

          return createTrainingEntry({
            type,
            content,
            fileName: file.name,
            mimeType: file.type,
          });
        })
      );

      window.setTimeout(() => {
        [...entries].reverse().forEach(onTrain);
        setIsTraining(false);
      }, 450);
    } catch (error) {
      console.error('File upload error:', error);
      alert(error instanceof Error ? error.message : 'Error reading file');
      setIsTraining(false);
    } finally {
      event.target.value = '';
    }
  };

  const handleDesktopFileImport = async () => {
    if (!window.desktop?.pickTrainingFiles) {
      return;
    }

    setIsTraining(true);

    try {
      const files = await window.desktop.pickTrainingFiles();

      if (files.length === 0) {
        setIsTraining(false);
        return;
      }

      window.setTimeout(() => {
        [...files].reverse().forEach((file) => {
          onTrain(
            createTrainingEntry({
              type: getTrainingTypeFromMimeType(file.mimeType),
              content: file.content,
              fileName: file.name,
              mimeType: file.mimeType,
            })
          );
        });

        setIsTraining(false);
      }, 450);
    } catch {
      alert('Error reading files from the desktop picker');
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Train Your AI Model</h3>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Train your AI with text, documents, or GitHub repositories. Supports Ollama integration for advanced training.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex gap-1 rounded-lg bg-slate-100 p-1">
          {[
            { id: 'text', label: 'Text Input', icon: FileText },
            { id: 'files', label: 'File Upload', icon: Upload },
            { id: 'github', label: 'GitHub Skills', icon: GitBranch },
            { id: 'unsloth', label: 'Unsloth Training', icon: Zap },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FileText className="h-5 w-5 text-indigo-600" />
            Paste Training Text
          </h3>

          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Paste English notes, documentation, manuals, specifications, procedures, or study material..."
            className="w-full rounded-lg border border-slate-300 p-4 font-mono text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            rows={7}
            disabled={isTraining}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Best results come from clean English text with real sentences and headings.
            </p>
            <button
              onClick={handleTextTrain}
              disabled={isTraining || !inputText.trim()}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isTraining ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                  Learning...
                </>
              ) : (
                'Train Model'
              )}
            </button>
          </div>
        </div>
      )}

      {/* File Upload Tab */}
      {activeTab === 'files' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Upload className="h-5 w-5 text-green-600" />
            Import Documents
          </h3>

          <p className="mb-4 text-sm text-slate-600">
            Recommended: TXT, MD, JSON, CSV, XML, YAML, log files, source code, and PDFs. PDFs are
            automatically scanned for text extraction. Images, videos, and audio are stored as local reference records.
          </p>

          {isDesktop && (
            <button
              onClick={handleDesktopFileImport}
              disabled={isTraining}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FolderOpen className="h-4 w-4" />
              Import from native desktop file picker
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept=".txt,.md,.json,.csv,.log,.ini,.yaml,.yml,.xml,.js,.jsx,.ts,.tsx,.py,.c,.cpp,.h,.hpp,.pdf,.png,.jpg,.jpeg,.gif,.webp,.mp4,.webm,.mp3,.wav,.ogg"
            disabled={isTraining}
            multiple
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isTraining}
            className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition-all hover:border-green-500 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="mx-auto mb-2 h-8 w-8 text-slate-400" />
            <p className="font-medium text-slate-700">Choose one or more files</p>
            <p className="mt-1 text-xs text-slate-500">Text-like documents will be read into the model</p>
          </button>
        </div>
      )}

      {/* GitHub Skills Tab */}
      {activeTab === 'github' && (
        <GitHubSkillsImporter onTrain={onTrain} />
      )}

      {/* Unsloth Training Tab */}
      {activeTab === 'unsloth' && (
        <UnslothTrainer trainingHistory={trainingHistory} />
      )}

      {trainingHistory.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Training History ({trainingHistory.length})
          </h3>

          <div className="space-y-3 max-h-72 overflow-y-auto">
            {trainingHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="mt-1">
                  {item.type === 'text' && <FileText className="h-4 w-4 text-blue-600" />}
                  {item.type === 'pdf' && <FileText className="h-4 w-4 text-red-600" />}
                  {item.type === 'image' && <ImageIcon className="h-4 w-4 text-purple-600" />}
                  {item.type === 'video' && <ImageIcon className="h-4 w-4 text-orange-600" />}
                  {item.type === 'audio' && <Volume2 className="h-4 w-4 text-green-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {item.fileName || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} input`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.timestamp.toLocaleTimeString()} • {item.wordCount.toLocaleString()} words
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {item.extractedText.substring(0, 140)}
                    {item.extractedText.length > 140 ? '...' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
