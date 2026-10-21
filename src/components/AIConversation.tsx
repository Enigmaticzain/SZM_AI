import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Download } from 'lucide-react';
import { aiMultiplexer, AIConversationLog } from '@/utils/aiMultiplexer';
import { OllamaIntegration } from '@/utils/ollamaIntegration';
import { LocalLanguageModel, answerWithLocalModel } from '@/utils/localLanguageModel';

interface AIConversationProps {
  localModel: LocalLanguageModel;
}

export default function AIConversation({ localModel }: AIConversationProps) {
  const [conversations, setConversations] = useState<AIConversationLog[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<AIConversationLog | null>(null);
  const [topic, setTopic] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [aiSelection, setAiSelection] = useState({ ai1: 'local', ai2: 'ollama' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ollama = useRef(new OllamaIntegration());

  useEffect(() => {
    // Initialize AI multiplexer with available AIs
    aiMultiplexer.registerAI('local', localModel);
    aiMultiplexer.registerAI('ollama', ollama.current);
  }, [localModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const startConversation = async () => {
    if (!topic.trim() || !prompt.trim()) {
      alert('Please enter both a topic and initial prompt');
      return;
    }

    setIsRunning(true);
    try {
      console.log('Starting conversation with:', aiSelection);
      console.log('Local model available:', !!localModel);
      console.log('Ollama available:', !!ollama.current);
      
      // Create local wrapper for local model
      const localModelWrapper = {
        generateResponse: async (query: string, context?: string) => {
          try {
            console.log('Local model query:', query);
            const result = answerWithLocalModel(localModel, query);
            console.log('Local model result:', result);
            return { success: result.success, response: result.answer };
          } catch (error) {
            console.error('Local model error:', error);
            return { success: false, response: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}` };
          }
        },
      };

      aiMultiplexer.registerAI('local', localModelWrapper);
      aiMultiplexer.registerAI('ollama', ollama.current);
      
      console.log('Registered AIs, starting conversation');

      const conversation = await aiMultiplexer.startConversation(
        aiSelection.ai1,
        aiSelection.ai2,
        topic,
        prompt
      );
      
      console.log('Conversation started:', conversation);

      setConversations((prev) => [...prev, conversation]);
      setSelectedConversation(conversation);
      setTopic('');
      setPrompt('');
    } catch (error) {
      console.error('Conversation error:', error);
      alert(`Failed to start conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const continueConversation = async () => {
    if (!selectedConversation || !prompt.trim()) {
      return;
    }

    setIsRunning(true);
    try {
      await aiMultiplexer.continueConversation(selectedConversation.id, prompt);
      
      // Refresh the conversation
      const updated = aiMultiplexer.getConversation(selectedConversation.id);
      if (updated) {
        setSelectedConversation(updated);
        setConversations((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
      }

      setPrompt('');
    } catch (error) {
      alert(`Failed to continue conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const deleteConversation = (id: string) => {
    aiMultiplexer.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
  };

  const exportConversation = (id: string) => {
    const conversation = aiMultiplexer.getConversation(id);
    if (!conversation) return;

    const json = JSON.stringify(conversation, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid h-full grid-cols-4 gap-4">
      {/* Conversation List */}
      <div className="col-span-1 flex flex-col rounded-lg border border-slate-300 bg-white overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm font-semibold">Conversations</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 p-3">
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-500">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full rounded-lg p-3 text-left text-sm transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'hover:bg-slate-100'
                }`}
              >
                <div className="font-medium line-clamp-1">{conv.topic}</div>
                <div className="text-xs text-slate-600">
                  {conv.participants.join(' ↔ ')}
                </div>
                <div className="text-xs text-slate-500">
                  {conv.messages.length} messages
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="col-span-3 flex flex-col rounded-lg border border-slate-300 bg-white overflow-hidden">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <h3 className="font-semibold">{selectedConversation.topic}</h3>
                <p className="text-sm text-slate-600">
                  {selectedConversation.participants.join(' ↔ ')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportConversation(selectedConversation.id)}
                  className="rounded bg-slate-200 p-2 hover:bg-slate-300"
                  title="Export conversation"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteConversation(selectedConversation.id)}
                  className="rounded bg-red-100 p-2 hover:bg-red-200 text-red-600"
                  title="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50">
              {selectedConversation.messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="rounded-lg bg-blue-100 p-3 text-sm text-blue-900">
                    <div className="font-semibold text-xs text-blue-700 mb-1">
                      {msg.from}:
                    </div>
                    <div className="whitespace-pre-wrap break-words">{msg.message}</div>
                  </div>
                  {msg.response && (
                    <div className="rounded-lg bg-green-100 p-3 text-sm text-green-900 ml-4">
                      <div className="font-semibold text-xs text-green-700 mb-1">
                        {msg.to} responds:
                      </div>
                      <div className="whitespace-pre-wrap break-words">{msg.response}</div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isRunning) {
                      continueConversation();
                    }
                  }}
                  placeholder="Continue conversation..."
                  disabled={isRunning}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50"
                />
                <button
                  onClick={continueConversation}
                  disabled={isRunning || !prompt.trim()}
                  className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* New Conversation Setup */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <MessageSquare className="h-16 w-16 text-slate-300 mb-4" />
              <h2 className="text-lg font-semibold mb-4">Start AI-to-AI Conversation</h2>

              <div className="w-full max-w-md space-y-4">
                {/* AI Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">AI 1</label>
                    <select
                      value={aiSelection.ai1}
                      onChange={(e) =>
                        setAiSelection({ ...aiSelection, ai1: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="local">Local Model</option>
                      <option value="ollama">Ollama</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">AI 2</label>
                    <select
                      value={aiSelection.ai2}
                      onChange={(e) =>
                        setAiSelection({ ...aiSelection, ai2: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="local">Local Model</option>
                      <option value="ollama">Ollama</option>
                    </select>
                  </div>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium mb-2">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Machine Learning, Web Design..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Initial Prompt */}
                <div>
                  <label className="block text-sm font-medium mb-2">Initial Question</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask a question to start the conversation..."
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                {/* Start Button */}
                <button
                  onClick={startConversation}
                  disabled={isRunning || !topic.trim() || !prompt.trim()}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isRunning ? 'Starting...' : 'Start Conversation'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
