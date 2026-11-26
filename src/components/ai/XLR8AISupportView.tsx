import React, { useState, useEffect, useRef } from 'react';
import { useCDP } from '../../context/CDPContext';
import { PageBackButton } from '../common/PageBackButton';
import {
  Bot,
  Send,
  Image as ImageIcon,
  X,
  RotateCcw,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  ExternalLink,
  Layers,
  Database,
  Radio,
  GitMerge,
  ShieldCheck,
  RefreshCw,
  Clock,
  Terminal,
  FileText
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  image?: string; // base64 data url
  imageName?: string;
  timestamp: string;
  model?: string;
  actionTabs?: Array<{ label: string; tab: string; icon?: string }>;
}

export const XLR8AISupportView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeSandboxId,
    schemas,
    ingestionSources,
    identities,
    audiences,
    destinations
  } = useCDP();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        text: `### 👋 Welcome to XLR8 AI Support

I am your dedicated enterprise troubleshooting and guidance agent for **XLR8 Realtime CDP**.

Whenever you encounter an issue or have questions, ask your question below — I will diagnose the root cause and provide step-by-step resolution instructions.`,
        timestamp: 'Just now',
        model: 'xlr8-copilot'
      }
    ];
  });

  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [pasteSuccessNotice, setPasteSuccessNotice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Global paste handler so the user can paste a screenshot anywhere on the page
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setAttachedImage(event.target.result as string);
                setAttachedImageName(`Pasted_Screenshot_${new Date().toLocaleTimeString().replace(/:/g, '-')}.png`);
                setPasteSuccessNotice(true);
                setTimeout(() => setPasteSuccessNotice(false), 3000);
                textareaRef.current?.focus();
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  // Handle file input upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachedImage(event.target.result as string);
          setAttachedImageName(file.name);
          textareaRef.current?.focus();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Send message to server Gemini endpoint
  const handleSendMessage = async () => {
    if ((!inputText.trim() && !attachedImage) || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: inputText.trim() || 'Please inspect this attached screenshot and troubleshoot the issue.',
      image: attachedImage || undefined,
      imageName: attachedImageName || undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMessage]);
    const currentInput = inputText;
    const currentImage = attachedImage;
    setInputText('');
    setAttachedImage(null);
    setAttachedImageName('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          imageBase64: currentImage,
          imageMimeType: 'image/png',
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          context: {
            activeSandbox: activeSandboxId,
            schemasCount: schemas.length,
            sourcesCount: ingestionSources.length,
            audiencesCount: audiences.length,
            destinationsCount: destinations.length,
            platform: 'XLR8 Realtime CDP'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      // Extract recommended action tabs based on the AI response content
      const lowerReply = (data.reply || '').toLowerCase();
      const detectedTabs: Array<{ label: string; tab: string }> = [];

      if (lowerReply.includes('schema') || lowerReply.includes('xdm')) {
        detectedTabs.push({ label: 'Open Schemas (XDM)', tab: 'schemas' });
      }
      if (lowerReply.includes('ingestion') || lowerReply.includes('stream') || lowerReply.includes('payload')) {
        detectedTabs.push({ label: 'Check Data Ingestion', tab: 'ingestion' });
      }
      if (lowerReply.includes('identity') || lowerReply.includes('graph') || lowerReply.includes('ecid')) {
        detectedTabs.push({ label: 'Inspect Identity Graph', tab: 'identities' });
      }
      if (lowerReply.includes('profile') || lowerReply.includes('merge policy')) {
        detectedTabs.push({ label: 'Customer 360 Profiles', tab: 'profiles' });
      }
      if (lowerReply.includes('dule') || lowerReply.includes('governance') || lowerReply.includes('consent')) {
        detectedTabs.push({ label: 'DULE Governance', tab: 'governance' });
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.reply || 'Analysis complete. Please check the recommendations above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data.model || 'xlr8-gemini-ai',
        actionTabs: detectedTabs.length > 0 ? detectedTabs : undefined
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to communicate with support agent:', err);
      // Fallback message
      const errorMessage: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        text: `### ⚠️ Troubleshooting Assistance

I encountered a temporary connection issue reaching the Gemini service.

**Direct Resolution Guidance for Your Query:**
1. **Schema Validation Errors**: Navigate to **Schemas (XDM)** -> Select your schema -> Ensure required fields match the incoming payload types and **Primary Identity** is toggled ON.
2. **Ingestion Stream Issues**: Go to **Data Ingestion & Streams** -> Review the **Dead Letter Queue (DLQ)** to examine rejected events.
3. **Identity Graph Splits**: Open **Identity Graph** -> Verify namespace mapping for ECID and CRM ID.

You can also re-paste your screenshot or retry your query.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'xlr8-local-fallback',
        actionTabs: [
          { label: 'Go to Schemas', tab: 'schemas' },
          { label: 'Check Ingestion', tab: 'ingestion' }
        ]
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        text: `### 🔄 Session Reset

Chat session cleared. You can paste a new screenshot with **Ctrl+V** (or **⌘+V**) or type your query below to troubleshoot any part of the **XLR8 Realtime CDP** platform.`,
        timestamp: 'Just now',
        model: 'xlr8-copilot'
      }
    ]);
  };

  // Simple Markdown renderer for headings, lists, bold text, code blocks
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-[#1E1E1E] mt-3 mb-1.5 flex items-center space-x-1.5">
            <span>{line.replace('### ', '')}</span>
          </h3>
        );
      }
      // Heading 2
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-base font-bold text-[#1E1E1E] mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Bullet list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const text = line.trim().substring(2);
        return (
          <li key={idx} className="text-xs text-[#2C2C2C] ml-4 list-disc leading-relaxed my-0.5">
            {formatInlineText(text)}
          </li>
        );
      }
      // Numbered list item
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1.5 text-xs text-[#2C2C2C]">
            <span className="w-5 h-5 rounded-full bg-[#EBF3FC] text-[#1473E6] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-[#C5DCFA]">
              {numMatch[1]}
            </span>
            <span className="flex-1 leading-relaxed">{formatInlineText(numMatch[2])}</span>
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-xs text-[#2C2C2C] leading-relaxed my-1">
          {formatInlineText(line)}
        </p>
      );
    });
  };

  const formatInlineText = (text: string) => {
    // Basic inline code `code`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#F2F4F7] text-[#0D66D0] font-mono text-[11px] border border-[#E1E5EA]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-[#1E1E1E]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#F8F9FA] text-[#2C2C2C] select-none" id="xlr8-ai-support-root">
      {/* Top Navigation & Applet Header with Dedicated Back Navigation */}
      <div className="h-14 bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] text-white border-b border-[#0E4DA4] px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
        <div className="flex items-center space-x-3">
          {/* Back Navigation Button */}
          <PageBackButton fallbackTab="home" fallbackLabel="Home" />

          <div className="h-5 w-[1px] bg-white/25 hidden sm:block" />

          {/* Breadcrumb & Title */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/25 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-white tracking-tight">XLR8 AI Support</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-sky-200 px-2 py-0.5 rounded-full border border-sky-300/40 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse" />
                  <span>Multimodal Active</span>
                </span>
              </div>
              <p className="text-[10px] text-blue-100 hidden sm:block">
                Screenshot Troubleshooting & Real-Time CDP Guidance Copilot
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2">
          {/* Sandbox Indicator */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/15 border border-white/25 text-[11px] text-blue-100">
            <span className="text-[10px] text-blue-100">Sandbox:</span>
            <span className="font-semibold text-white capitalize">{activeSandboxId}</span>
          </div>

          {/* Reset Conversation */}
          <button
            onClick={clearChat}
            className="px-2.5 py-1.5 rounded-lg border border-white/25 bg-white/15 hover:bg-white/25 text-xs font-medium text-white flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Start a new chat session"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-100" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Centered Chat Thread */}
        <div className="flex-1 flex flex-col h-full bg-[#F8F9FA] overflow-hidden">
          {/* Messages Scrollable Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
            {/* Paste Notification Banner */}
            {pasteSuccessNotice && (
              <div className="w-full max-w-3xl mx-auto mb-4 bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0284C7]" />
                  <span>Screenshot attached from clipboard! Type your question and hit Send.</span>
                </div>
                <button onClick={() => setPasteSuccessNotice(false)} className="text-[#0369A1] hover:text-[#0A3D82]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Centered Welcome Hero when no conversation messages exist yet */}
            {messages.length === 1 && (messages[0].id === 'msg-welcome' || messages[0].id === 'msg-reset') && !isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center py-6">
                <div className="w-full bg-white rounded-2xl border border-[#E1E5EA] shadow-sm p-8 sm:p-10 flex flex-col items-center text-center space-y-5">
                  {/* Robot Mascot Medallion */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#38BDF8] via-[#1473E6] to-[#0A3D82] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 ring-4 ring-[#EBF3FC]">
                      <Bot className="w-11 h-11 text-white" />
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0EA5E9] border-2 border-white flex items-center justify-center shadow-xs"
                      title="XLR8 AI Mascot Active"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  {/* Brand & Copilot Tag */}
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs font-bold text-[#1473E6]">XLR8 AI Support</span>
                    <span className="text-[10px] bg-[#EBF3FC] text-[#0D66D0] px-2 py-0.5 rounded-md font-mono border border-[#BFDBFE]">
                      {messages[0].model || 'xlr8-copilot'}
                    </span>
                  </div>

                  {/* Centered Welcome Copy */}
                  <div className="space-y-2.5 max-w-lg">
                    <h2 className="text-xl font-bold text-[#1E2229] tracking-tight">
                      {messages[0].id === 'msg-reset' ? 'Session Reset' : 'Welcome to XLR8 AI Support'}
                    </h2>
                    {messages[0].id === 'msg-reset' ? (
                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        Chat session cleared. Paste a new screenshot with <kbd className="px-1.5 py-0.5 font-mono text-xs bg-[#F2F4F7] rounded border border-[#E1E5EA] text-[#0D66D0]">Ctrl+V</kbd> (or <kbd className="px-1.5 py-0.5 font-mono text-xs bg-[#F2F4F7] rounded border border-[#E1E5EA] text-[#0D66D0]">⌘+V</kbd>) or type your query below to troubleshoot any part of the <strong className="text-[#1E2229]">XLR8 Realtime CDP</strong> platform.
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-[#4B5563] leading-relaxed">
                          I am your dedicated enterprise troubleshooting and guidance agent for{' '}
                          <strong className="text-[#1E2229]">XLR8 Realtime CDP</strong>.
                        </p>
                        <p className="text-sm text-[#4B5563] leading-relaxed">
                          Whenever you encounter an issue or have questions, ask your question below — I will diagnose the root cause and provide step-by-step resolution instructions.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto space-y-5">
                {/* Conversation Messages */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    {/* Author Label */}
                    <div className="flex items-center space-x-1.5 px-1 text-[11px] text-[#262A33]">
                      {msg.role === 'user' ? (
                        <>
                          <span className="font-semibold text-[#1E1E1E]">You</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#38BDF8] to-[#1473E6] text-white flex items-center justify-center shadow-2xs">
                            <Bot className="w-3 h-3" />
                          </div>
                          <span className="font-semibold text-[#1473E6]">XLR8 AI Support</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                          {msg.model && (
                            <span className="text-[9px] bg-[#EBF3FC] text-[#0D66D0] px-1.5 py-0.2 rounded font-mono">
                              {msg.model}
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-3xl rounded-2xl p-4 shadow-2xs ${
                        msg.role === 'user'
                          ? 'bg-[#1473E6] text-white rounded-tr-xs'
                          : 'bg-white text-[#2C2C2C] border border-[#E1E5EA] rounded-tl-xs'
                      }`}
                    >
                      {/* Attached Screenshot in message */}
                      {msg.image && (
                        <div className="mb-3">
                          <div className="relative group inline-block rounded-xl overflow-hidden border border-white/20 shadow-xs">
                            <img
                              src={msg.image}
                              alt="Uploaded Screenshot"
                              className="max-h-64 max-w-full rounded-lg object-contain bg-black/10 cursor-pointer transition-transform group-hover:scale-[1.01]"
                              onClick={() => setLightboxImage(msg.image!)}
                            />
                            <div
                              onClick={() => setLightboxImage(msg.image!)}
                              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold space-x-1.5"
                            >
                              <Maximize2 className="w-4 h-4" />
                              <span>Click to Enlarge</span>
                            </div>
                          </div>
                          {msg.imageName && (
                            <span
                              className={`text-[10px] block mt-1 ${
                                msg.role === 'user' ? 'text-white/80' : 'text-[#262A33]'
                              } font-mono`}
                            >
                              📎 {msg.imageName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message Content */}
                      <div className={msg.role === 'user' ? 'text-sm text-white' : 'space-y-1'}>
                        {msg.role === 'user' ? (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        ) : (
                          renderMarkdown(msg.text)
                        )}
                      </div>

                      {/* Remediation Action Buttons */}
                      {msg.actionTabs && msg.actionTabs.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#F2F4F7] flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#262A33] block w-full">
                            Remediation Shortcuts:
                          </span>
                          {msg.actionTabs.map((action) => (
                            <button
                              key={action.tab}
                              onClick={() => setActiveTab(action.tab)}
                              className="px-3 py-1.5 rounded-lg bg-[#F2F4F7] hover:bg-[#EBF3FC] text-[#0D66D0] hover:text-[#1473E6] border border-[#D5D5D5] hover:border-[#C5DCFA] text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                            >
                              <span>{action.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading / Thinking State */}
                {isLoading && (
                  <div className="flex flex-col items-start space-y-1.5">
                    <div className="flex items-center space-x-1.5 px-1 text-[11px] text-[#262A33]">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#38BDF8] to-[#1473E6] text-white flex items-center justify-center shadow-2xs">
                        <Bot className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-[#1473E6]">XLR8 AI Support</span>
                      <span>•</span>
                      <span>Analyzing screenshot...</span>
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-xs p-4 border border-[#E1E5EA] shadow-2xs flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-[#1473E6] border-t-transparent rounded-full animate-spin" />
                      <div className="text-xs text-[#262A33]">
                        <span className="font-semibold text-[#1E1E1E] block">Inspecting Screenshot & Error Context</span>
                        <span className="text-[11px] text-[#262A33]">Running multimodal diagnostics across XDM, Ingestion, and Identity Graph...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Screenshot Drop / Attachment Preview Bar */}
          {attachedImage && (
            <div className="px-4 sm:px-6 pt-2">
              <div className="max-w-3xl mx-auto bg-white rounded-xl border border-[#1473E6] p-2.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={attachedImage}
                    alt="Attached Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-[#E1E5EA]"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#1E1E1E] truncate max-w-[240px]">
                        {attachedImageName || 'Screenshot attached'}
                      </span>
                      <span className="text-[10px] font-semibold bg-[#E0F2FE] text-[#0369A1] px-1.5 py-0.2 rounded border border-[#BAE6FD]">
                        Ready for Multimodal
                      </span>
                    </div>
                    <span className="text-[10px] text-[#262A33]">
                      Press Enter or click Send to submit with your question
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAttachedImage(null);
                    setAttachedImageName('');
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-[#F2F4F7] text-[#262A33] hover:text-[#1E1E1E] flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove screenshot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Input Box / Composer */}
          <div className="p-4 sm:p-6 bg-white border-t border-[#E1E5EA]">
            <div className="max-w-3xl mx-auto">
              <div className="relative border border-[#D5D5D5] focus-within:border-[#1473E6] focus-within:ring-2 focus-within:ring-[#1473E6]/20 rounded-2xl bg-white shadow-2xs transition-all">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    attachedImage
                      ? 'Describe what happened before this error screenshot, or press Enter to diagnose...'
                      : 'Describe an XDM schema error, ingestion issue, or identity question...'
                  }
                  rows={2}
                  className="w-full px-4 pt-3.5 pb-14 rounded-2xl resize-none outline-hidden text-sm sm:text-base text-[#1E1E1E] placeholder:text-[#64748B]"
                />

                {/* Composer Controls Bar */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    {/* File Upload Pill Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#1473E6] hover:from-[#0284C7] hover:to-[#0D66D0] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap active:scale-98"
                      title="Upload screenshot from file"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-white shrink-0" />
                      <span>Upload Image</span>
                    </button>

                    <span className="text-[10px] text-[#475569] hidden md:inline">
                      Tip: Press <kbd className="px-1.5 py-0.5 font-mono bg-[#F2F4F7] rounded border border-[#E1E5EA] text-[#1E2229]">Ctrl+V</kbd> anywhere to paste screenshot
                    </span>
                  </div>

                  {/* Send Pill Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={(!inputText.trim() && !attachedImage) || isLoading}
                    className={`px-4 py-1.5 rounded-full font-semibold text-xs flex items-center space-x-1.5 transition-all whitespace-nowrap ${
                      (inputText.trim() || attachedImage) && !isLoading
                        ? 'bg-gradient-to-r from-[#1473E6] via-[#0F58B8] to-[#0A3D82] hover:from-[#1982FC] hover:to-[#0D4A9E] text-white shadow-xs cursor-pointer active:scale-98'
                        : 'bg-gradient-to-r from-[#93C5FD] to-[#60A5FA] text-white/95 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-[#262A33]">
                <span>XLR8 Realtime CDP Support • Powered by Gemini Multimodal Reasoning</span>
                <span className="hidden sm:inline">Use Shift + Enter for new lines</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-2xl p-2 border border-white/20">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage}
              alt="Expanded Screenshot"
              className="max-h-[85vh] max-w-full rounded-xl object-contain mx-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
