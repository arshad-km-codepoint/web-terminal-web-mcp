import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Bot,
  User,
  Coffee,
  Minimize2,
  Maximize2,
  X,
} from 'lucide-react';


interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  '🔍 Search for "Customer Orders V2" datasets',
  '☕ What are our lowest quality datasets?',
  '🔄 Show pipelines with recent SLA warnings',
  '💰 Break down our cloud infrastructure costs',
];

export function Chatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'model',
      text: "Hello! I am your **Happy Coffee Data Catalog AI Copilot** powered by **DeepSeek**.\n\nAsk me about datasets, schema definitions, pipeline health, data quality checks, or cloud infrastructure costs!",
      timestamp: new Date(),
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: 'model',
      text: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessagePlaceholder]);

    const checkDirectUserNavigation = (text: string) => {
      const lower = text.trim().toLowerCase();

      // Home tabs: e.g. "navigate to pipelines tab", "switch to datasets tab", "open pipelines tab"
      const tabMatch = lower.match(/(?:navigate|go|switch|open|view)(?: to)?(?: the)? (all|datasets|sources|pipelines) tab/i);
      if (tabMatch) {
        navigate(`/?tab=${tabMatch[1]}`);
        return;
      }

      // Top level pages: e.g. "navigate to pipelines", "go to datasets", "open costs"
      const pageMatch = lower.match(/(?:navigate|go|switch|open|view)(?: to)?(?: the)? (pipelines|datasets|costs|home)/i);
      if (pageMatch) {
        const page = pageMatch[1];
        navigate(page === 'home' ? '/' : `/${page}`);
        return;
      }

      // Search commands: e.g. "search iot", "search for customer orders"
      const searchMatch = lower.match(/^(?:search|find)(?: for)? ["']?([^"']+)["']?$/i);
      if (searchMatch) {
        navigate(`/search?q=${encodeURIComponent(searchMatch[1].trim())}`);
        return;
      }
    };

    checkDirectUserNavigation(textToSend);

    try {
      const response = await fetch('http://localhost:3001/api/chat?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      const executedToolSignatures = new Set<string>();

      const executeNavigationForTool = (toolName: string, args: Record<string, any>) => {
        switch (toolName) {
          case 'view_home_dashboard':
          case 'navigate_to_home': {
            const tab = args.tab || 'all';
            const q = args.query || args.q || '';
            navigate(`/?tab=${encodeURIComponent(tab)}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
            break;
          }
          case 'search_global_catalog': {
            if (args.query) {
              navigate(`/search?q=${encodeURIComponent(args.query)}&tab=${encodeURIComponent(args.type || 'all')}`);
            }
            break;
          }
          case 'filter_datasets': {
            const params = new URLSearchParams();
            if (args.query) params.set('q', args.query);
            if (args.types?.length) args.types.forEach((t: string) => params.append('type', t));
            if (args.tags?.length) args.tags.forEach((t: string) => params.append('tag', t));
            if (args.sortKey) params.set('sort', args.sortKey);
            if (args.page) params.set('page', String(args.page));
            navigate(`/datasets${params.toString() ? '?' + params.toString() : ''}`);
            break;
          }
          case 'view_dataset_details': {
            if (args.id) {
              const params = new URLSearchParams();
              if (args.tab) params.set('tab', args.tab);
              navigate(`/datasets/${encodeURIComponent(args.id)}${params.toString() ? '?' + params.toString() : ''}`);
            }
            break;
          }
          case 'filter_pipelines': {
            const params = new URLSearchParams();
            if (args.query) params.set('q', args.query);
            if (args.statuses?.length) args.statuses.forEach((s: string) => params.append('status', s));
            if (args.engines?.length) args.engines.forEach((e: string) => params.append('engine', e));
            navigate(`/pipelines${params.toString() ? '?' + params.toString() : ''}`);
            break;
          }
          case 'view_pipeline_details': {
            if (args.id) {
              const params = new URLSearchParams();
              if (args.tab) params.set('tab', args.tab);
              navigate(`/pipelines/${encodeURIComponent(args.id)}${params.toString() ? '?' + params.toString() : ''}`);
            }
            break;
          }
          case 'trigger_pipeline_execution':
          case 'view_pipeline_run_logs': {
            const pId = args.pipelineId || args.id;
            if (pId) {
              navigate(`/pipelines/${encodeURIComponent(pId)}?tab=runs`);
            }
            break;
          }
          case 'analyze_infrastructure_costs': {
            navigate('/costs');
            break;
          }
        }
      };

      const checkAndTriggerNavigation = (text: string) => {
        const toolRegex = /(view_home_dashboard|search_global_catalog|filter_datasets|view_dataset_details|filter_pipelines|view_pipeline_details|trigger_pipeline_execution|view_pipeline_run_logs|analyze_infrastructure_costs|navigate_to_home)\s*\(\s*(\{[\s\S]*?\}|)\s*\)/g;
        let match;
        while ((match = toolRegex.exec(text)) !== null) {
          const [fullMatch, toolName, argsRaw] = match;
          if (executedToolSignatures.has(fullMatch)) continue;

          try {
            const args = argsRaw.trim() ? JSON.parse(argsRaw) : {};
            executedToolSignatures.add(fullMatch);
            executeNavigationForTool(toolName, args);
          } catch {
            // Ignore incomplete JSON chunks while streaming
          }
        }
      };

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  checkAndTriggerNavigation(accumulatedText);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId ? { ...msg, text: accumulatedText } : msg
                    )
                  );
                }
              } catch {
                // Ignore parse errors on partial streams
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Chat stream error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: `⚠️ **Error:** Unable to reach the AI Assistant backend. Please verify that the backend server is running on port 3001.\n\n*${err.message}*`,
              }
            : msg
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'initial',
        role: 'model',
        text: "Chat cleared. What else can I help you discover in the **Happy Coffee Data Catalog**?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 p-3.5 text-white shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all duration-200 border border-blue-400/40"
          title="Open Happy Coffee AI Assistant"
        >
          <div className="relative">
            <Coffee className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-blue-200 animate-pulse" />
          </div>
          <span className="text-xs font-semibold pr-1">Ask DeepSeek AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col ${
            isExpanded
              ? 'w-[680px] h-[720px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)]'
              : 'w-[440px] h-[600px] max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)]'
          } rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden transition-all duration-200 animate-fadeIn`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-850 border-b border-gray-750 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-sm">
                <Coffee className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-cream-100">Coffee AI Copilot</h3>
                  <span className="flex items-center gap-0.5 rounded bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-medium text-blue-400 border border-blue-500/20">
                    <Sparkles className="h-2.5 w-2.5" />
                    DeepSeek V3
                  </span>
                </div>
                <p className="text-[10px] text-gray-400">Happy Coffee Data Catalog Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-400">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded p-1.5 hover:bg-gray-750 hover:text-gray-200 transition-colors"
                title={isExpanded ? 'Collapse window' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={clearChat}
                className="rounded p-1.5 hover:bg-gray-750 hover:text-gray-200 transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1.5 hover:bg-gray-750 hover:text-gray-200 transition-colors"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin bg-gray-900">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'model' && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/30 text-blue-400 text-xs mt-0.5 border border-blue-500/30">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-md whitespace-pre-wrap break-words'
                      : 'bg-gray-800 text-cream-100 rounded-bl-none border border-gray-700/80 shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div>{msg.text}</div>
                  ) : (
                    <div className="prose-dark max-w-none break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="my-2.5 overflow-x-auto rounded-lg border border-gray-700 bg-gray-900/80 shadow-inner">
                              <table className="w-full text-left text-[11px] border-collapse" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-gray-850 text-gray-200 font-semibold border-b border-gray-700" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-3 py-1.5 border-r border-gray-750 last:border-r-0 whitespace-nowrap text-blue-300 font-medium" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-3 py-1.5 border-t border-gray-750 border-r border-gray-750/50 last:border-r-0 text-gray-200" {...props} />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="my-2 border-l-3 border-blue-500 bg-blue-950/40 px-3 py-1.5 rounded-r-md text-[11px] text-blue-200 italic shadow-sm" {...props} />
                          ),
                          code: ({ node, className, children, ...props }: any) => {
                            const isInline = !className?.includes('language-');
                            return isInline ? (
                              <code className="rounded bg-gray-900 px-1.5 py-0.5 text-[11px] font-mono text-blue-300 border border-gray-700/70" {...props}>
                                {children}
                              </code>
                            ) : (
                              <div className="my-2 overflow-x-auto rounded-lg bg-gray-950 p-2.5 font-mono text-[11px] text-gray-200 border border-gray-800">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </div>
                            );
                          },
                          h1: ({ node, ...props }) => <h1 className="text-sm font-bold text-white mt-2.5 mb-1.5 pb-1 border-b border-gray-700" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xs font-bold text-white mt-2 mb-1" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-[11.5px] font-bold text-cream-100 mt-1.5 mb-0.5" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5 text-gray-200" {...props} />,
                          ol: ({ node, ...props }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5 text-gray-200" {...props} />,
                          li: ({ node, ...props }) => <li className="leading-relaxed text-gray-200" {...props} />,
                          hr: ({ node, ...props }) => <hr className="my-2.5 border-gray-700/70" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-400 underline hover:text-blue-300" target="_blank" rel="noreferrer" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {msg.role === 'model' && msg.text && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center h-5 w-5 rounded-full bg-gray-700 text-gray-300 hover:text-white border border-gray-600 transition-all shadow"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-2.5 w-2.5" />
                      )}
                    </button>
                  )}
                </div>


                {msg.role === 'user' && (
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-300 text-xs mt-0.5 border border-gray-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-2.5 items-center text-xs text-blue-400 animate-pulse">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600/30 border border-blue-500/30">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1 text-[11px]">
                  <span>DeepSeek thinking</span>
                  <span className="flex gap-0.5">
                    <span className="animate-bounce delay-75">.</span>
                    <span className="animate-bounce delay-150">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length <= 3 && !isGenerating && (
            <div className="px-3 py-2 bg-gray-850/80 border-t border-gray-750 flex flex-wrap gap-1.5 flex-shrink-0">
              {SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  className="rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2.5 py-1 text-[10px] text-gray-300 hover:text-cream-100 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-gray-850 border-t border-gray-750 flex-shrink-0">
            <div className="flex items-center gap-2 rounded-xl bg-gray-900 border border-gray-700 px-3 py-2 focus-within:border-blue-500 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask DeepSeek about Happy Coffee datasets, pipelines..."
                rows={1}
                className="flex-1 resize-none bg-transparent text-xs text-cream-100 placeholder-gray-500 focus:outline-none min-h-[34px] max-h-24 overflow-y-auto leading-relaxed"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isGenerating}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white disabled:opacity-40 disabled:hover:bg-blue-600 hover:bg-blue-500 transition-colors flex-shrink-0 shadow-sm"
                title="Send message (Enter)"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 px-1">
              <span>Shift+Enter for newline</span>
              <span className="text-blue-400 font-medium">DeepSeek-V3 • Data Portal Tools</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
