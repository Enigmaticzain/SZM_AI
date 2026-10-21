import { useEffect, useRef, useState } from 'react';
import {
  answerWithLocalModel,
  getLocalModelStatus,
  LocalLanguageModel,
} from '@/utils/localLanguageModel';
import { performWebSearch, fetchWebContent } from '@/utils/webSearch';
import { OllamaIntegration } from '@/utils/ollamaIntegration';
import { memorySystem } from '@/utils/memorySystem';
import { learningEngine } from '@/utils/learningEngine';

interface ConsoleMessage {
  id: string;
  type: 'input' | 'output' | 'error' | 'status' | 'web-search' | 'ollama';
  content: string;
  timestamp: Date;
  source?: string;
}

interface ConsoleProps {
  model: LocalLanguageModel;
}

export default function Console({ model }: ConsoleProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [autoWebSearch, setAutoWebSearch] = useState(true);
  const [useOllama, setUseOllama] = useState(false);
  const [ollamaModel, setOllamaModel] = useState('llama2');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ollama = useRef(new OllamaIntegration());
  const sessionStarted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize memory session on mount
  useEffect(() => {
    if (!sessionStarted.current) {
      memorySystem.startSession();
      sessionStarted.current = true;
    }

    // Check Ollama connection
    const checkOllama = async () => {
      const result = await ollama.current.checkConnection();
      if (result.success) {
        const models = await ollama.current.getAvailableModels();
        if (models.success && models.models.length > 0) {
          setOllamaModel(models.models[0].name);
          ollama.current.setModel(models.models[0].name);
        }
      }
    };
    checkOllama();

    return () => {
      if (sessionStarted.current) {
        memorySystem.endSession();
      }
    };
  }, []);

  const addMessage = (type: ConsoleMessage['type'], content: string, source?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        content,
        timestamp: new Date(),
        source,
      },
    ]);
  };

  const handleWebSearch = async (query: string) => {
    addMessage('status', `🔍 Searching web for: ${query}`);
    
    // Record the search in memory
    await memorySystem.recordMemory('question', query, 'Web Search');
    
    const searchResult = await performWebSearch(query);
    if (searchResult.success && searchResult.results.length > 0) {
      searchResult.results.forEach((result, index) => {
        addMessage('web-search', `${result.title}\n${result.snippet}`, result.url);
        // Learn from search results
        learningEngine.addKnowledge(result.url, `${result.title}\n${result.snippet}`, 'web-search');
      });
      
      // Fetch content from first result for training
      if (searchResult.results[0]?.url && searchResult.results[0].url !== '#') {
        const contentResult = await fetchWebContent(searchResult.results[0].url);
        if (contentResult.success) {
          addMessage('status', `📄 Fetched content from ${searchResult.results[0].url}`);
          // Learn from fetched content
          learningEngine.addKnowledge(searchResult.results[0].url, contentResult.content, 'web-search');
          return contentResult.content;
        }
      }
    } else {
      addMessage('error', `Web search failed: ${searchResult.error || 'No results found'}`);
    }
    return null;
  };

  const handleOllamaQuery = async (query: string, context?: string) => {
    addMessage('status', `🤖 Querying Ollama model: ${ollamaModel}`);
    
    const result = await ollama.current.generateResponse(query, context);
    if (result.success) {
      addMessage('ollama', result.response, `Ollama: ${ollamaModel}`);
      // Record Ollama interaction
      await memorySystem.recordMemory('ai-conversation', `Q: ${query}\nA: ${result.response}`, 'Ollama');
      return result.response;
    } else {
      addMessage('error', `Ollama error: ${result.error}`);
      return null;
    }
  };

  const handleExecute = async () => {
    if (!input.trim()) {
      return;
    }

    const question = input.trim();
    addMessage('input', `> ${question}`);
    setInput('');
    setIsExecuting(true);

    try {
      let webContext = null;
      let ollamaResponse = null;

      // Record the question
      await memorySystem.recordMemory('question', question, 'Console Input');

      // Auto web search if enabled
      if (autoWebSearch) {
        webContext = await handleWebSearch(question);
      }

      // Use Ollama if enabled
      if (useOllama) {
        const trainingContext = ollama.current.getTrainingContext();
        const fullContext = [trainingContext, webContext].filter(Boolean).join('\n\n');
        ollamaResponse = await handleOllamaQuery(question, fullContext);
      }

      // Always try local model
      window.setTimeout(async () => {
        const result = answerWithLocalModel(model, question);

        if (result.success) {
          addMessage('output', result.answer, 'Local Model');
          // Record the answer
          await memorySystem.recordMemory('answer', result.answer, 'Local Model');
        } else {
          addMessage('error', result.answer);
        }

        if (result.matchedTerms.length > 0) {
          addMessage('status', `Matched terms: ${result.matchedTerms.join(', ')}`);
        }

        if (result.citations.length > 0) {
          addMessage(
            'status',
            result.citations
              .map(
                (citation, index) =>
                  `${index + 1}. ${citation.sourceName} (${citation.score.toFixed(2)})\n${citation.excerpt}`
              )
              .join('\n\n')
          );
        }

        setIsExecuting(false);
      }, 220);
    } catch (error) {
      addMessage('error', `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsExecuting(false);
    }
  };

  const handleStatus = async () => {
    setIsExecuting(true);

    window.setTimeout(() => {
      addMessage('status', getLocalModelStatus(model));
      setIsExecuting(false);
    }, 120);
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold">SZM AI Console</span>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={autoWebSearch}
              onChange={(e) => setAutoWebSearch(e.target.checked)}
              className="rounded"
            />
            Web Search
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={useOllama}
              onChange={(e) => setUseOllama(e.target.checked)}
              className="rounded"
            />
            Ollama
          </label>
          <button
            onClick={handleStatus}
            disabled={isExecuting}
            className="rounded bg-slate-700 px-2 py-1 text-xs transition-colors hover:bg-slate-600 disabled:opacity-50"
          >
            Status
          </button>
          <button
            onClick={handleClear}
            className="rounded bg-slate-700 px-2 py-1 text-xs transition-colors hover:bg-slate-600"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {messages.length === 0 && (
          <div className="py-8 text-center text-slate-500">
            <p>Ask questions and get answers from multiple AI sources:</p>
            <p className="mt-2 text-xs">
              • Local trained model from your documents<br/>
              • Web search results (if enabled)<br/>
              • Ollama models (if enabled and running)
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="flex gap-2 pb-1 border-b border-slate-700/30">
            <span className="flex-shrink-0 w-4 text-slate-500">
              {message.type === 'input' && '→'}
              {message.type === 'output' && '✓'}
              {message.type === 'error' && '✗'}
              {message.type === 'status' && 'ℹ'}
              {message.type === 'web-search' && '🌐'}
              {message.type === 'ollama' && '🤖'}
            </span>
            <div className="flex-1 min-w-0">
              <span
                className={`whitespace-pre-wrap break-words text-xs block overflow-hidden ${
                  message.type === 'input'
                    ? 'text-blue-400'
                    : message.type === 'error'
                    ? 'text-red-400'
                    : message.type === 'status'
                    ? 'text-yellow-400'
                    : message.type === 'web-search'
                    ? 'text-green-400'
                    : message.type === 'ollama'
                    ? 'text-purple-400'
                    : 'text-slate-300'
                }`}
                title={message.content}
              >
                {message.content}
              </span>
              {message.source && (
                <div className="mt-0.5 text-xs text-slate-500">
                  → {message.source}
                </div>
              )}
            </div>
          </div>
        ))}

        {isExecuting && (
          <div className="flex gap-2 text-slate-400">
            <span>→</span>
            <span className="animate-pulse">Processing with AI sources...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-700 bg-slate-800 px-4 py-3">
        <div className="flex gap-2">
          <span className="flex-shrink-0 text-slate-500">$</span>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder="Ask your AI assistant (local + web + ollama)..."
            className="flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 disabled:opacity-50"
          />
          <button
            onClick={handleExecute}
            disabled={isExecuting || !input.trim()}
            className="rounded bg-blue-600 px-3 py-1 text-xs font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isExecuting ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
}
