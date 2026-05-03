import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore, Message, FileNode } from '../store/agentStore';
import { chatWithNathanStream } from '../services/geminiService';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, Bot, User, Sparkles, Loader2, Save, FileCode2, Trash, Settings2, X, Copy, Check, TerminalIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PROVIDERS = [
  { id: 'gemini', name: 'Gemini', models: ['gemini-3-flash-preview', 'gemini-3.1-pro-preview', 'gemini-flash-latest'] },
  { id: 'openai', name: 'OpenAI (ChatGPT)', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'mistral', name: 'Mistral', models: ['pixtral-large-latest', 'mistral-large-latest', 'mistral-small-latest'] },
];

const CodeBlock = ({ children, className, inline }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const code = String(children).replace(/\n$/, '');
  const isTerminalCommand = match && (match[1] === 'bash' || match[1] === 'sh' || match[1] === 'shell');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    const name = window.prompt("Name this snippet:", "New snippet");
    if (name) {
      useAgentStore.getState().addSnippet({
        id: crypto.randomUUID(),
        name,
        code
      });
    }
  };

  const handleRun = () => {
    const lines = code.split('\n').filter(Boolean);
    const commands = [];
    for (const line of lines) {
       commands.push(`nathan-workspace % ${line}`);
       commands.push('✓ Executed (Simulation)');
    }
    useAgentStore.getState().addTerminalOutput(commands);
  };

  if (!inline && match) {
    return (
      <div className="relative group/code overflow-hidden bg-[#0d1117] border border-border/50 rounded-lg max-w-full my-4">
        <div className="absolute right-2 top-2 z-20 flex gap-2">
          {isTerminalCommand && (
            <button
              onClick={handleRun}
              className="opacity-0 group-hover/code:opacity-100 bg-primary/20 text-primary border border-primary/30 p-1.5 rounded text-xs hover:bg-primary/40 hover:text-white transition-all flex items-center gap-1 shadow-sm font-bold"
              title="Run in Terminal"
            >
              <TerminalIcon size={12} /> Run
            </button>
          )}
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover/code:opacity-100 bg-background border border-border p-1.5 rounded text-xs text-muted-foreground hover:text-white transition-opacity flex items-center gap-1 shadow-sm"
            title="Copy Code"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {!isTerminalCommand && (
            <button
              onClick={handleSave}
              className="opacity-0 group-hover/code:opacity-100 bg-background border border-border p-1.5 rounded text-xs text-muted-foreground hover:text-white transition-opacity flex items-center gap-1 shadow-sm"
              title="Save Snippet"
            >
              <Save size={12} /> Save
            </button>
          )}
        </div>
        <div className="w-full overflow-x-auto p-4">
          <code className={className}>
            {children}
          </code>
        </div>
      </div>
    );
  }

  return <code className={`${className} bg-muted px-1.5 py-0.5 rounded break-words whitespace-pre-wrap`}>{children}</code>;
};

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [selectedModel, setSelectedModel] = useState(PROVIDERS[0].models[0]);
  const [previewSnippet, setPreviewSnippet] = useState<{ id: string; name: string; code: string } | null>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  
  const messages = useAgentStore(state => state.messages);
  const addMessage = useAgentStore(state => state.addMessage);
  const updateMessage = useAgentStore(state => state.updateMessage);
  const snippets = useAgentStore(state => state.snippets);
  const removeSnippet = useAgentStore(state => state.removeSnippet);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollViewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') || scrollRef.current.querySelector('[data-slot="scroll-area-viewport"]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      } else {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const modelMsgId = crypto.randomUUID();
    addMessage({ id: modelMsgId, role: 'model', content: '', isStreaming: true });

    try {
      const rawHistory = messages
        .filter((m) => m.id !== 'welcome' && m.content.trim() !== '')
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));
        
      const history: any[] = [];
      for (const msg of rawHistory) {
        if (history.length === 0) {
          if (msg.role === 'user') history.push(msg);
        } else {
          if (history[history.length - 1].role !== msg.role) {
            history.push(msg);
          } else {
            history[history.length - 1].parts[0].text += '\n\n' + msg.parts[0].text;
          }
        }
      }
      
      if (history.length > 0 && history[history.length - 1].role === 'user') {
        history.push({ role: 'model', parts: [{ text: 'Understood.' }] });
      }

      let accumulatedText = "";
      const stream = chatWithNathanStream(userMsg.content, history, selectedProvider.id, selectedModel);
      
      for await (const chunk of stream) {
         accumulatedText += chunk;
         updateMessage(modelMsgId, accumulatedText, true);
         parseStreamAndApplyFiles(accumulatedText);
      }
      
      // Finishing stream
      updateMessage(modelMsgId, accumulatedText, false);
      parseStreamAndApplyFiles(accumulatedText);

    } catch (error: any) {
      console.error(error);
      updateMessage(modelMsgId, `**System Error**: ${error.message || String(error)}`, false);
    } finally {
      setIsTyping(false);
    }
  };
  
  const parseStreamAndApplyFiles = (text: string) => {
    const setFiles = useAgentStore.getState().setFiles;
    const files = useAgentStore.getState().files;
    const setSelectedFile = useAgentStore.getState().setSelectedFile;

    const regex = /```[a-z]*\s+path="([^"]+)"\n([\s\S]*?)(?:```|$)/g;
    
    let match;
    const newFiles = JSON.parse(JSON.stringify(files));
    
    const updateFileHelper = (tree: FileNode[], pathParts: string[], content: string): { tree: FileNode[], fileNode: FileNode } => {
        const [currentPart, ...rest] = pathParts;
        if (rest.length === 0) {
            let existingFileIndex = tree.findIndex(f => f.name === currentPart && f.type === 'file');
            if (existingFileIndex >= 0) {
                tree[existingFileIndex].content = content;
                return { tree, fileNode: tree[existingFileIndex] };
            } else {
                const newNode: FileNode = { id: crypto.randomUUID(), name: currentPart, type: 'file', content };
                tree.push(newNode);
                return { tree, fileNode: newNode };
            }
        } else {
            let existingFolderIndex = tree.findIndex(f => f.name === currentPart && f.type === 'folder');
            if (existingFolderIndex < 0) {
                const newFolder: FileNode = { id: crypto.randomUUID(), name: currentPart, type: 'folder', children: [], isOpen: true };
                tree.push(newFolder);
                existingFolderIndex = tree.length - 1;
            }
            const res = updateFileHelper(tree[existingFolderIndex].children || [], rest, content);
            tree[existingFolderIndex].children = res.tree;
            return { tree, fileNode: res.fileNode };
        }
    };

    let lastFileNode: FileNode | null = null;
    let found = false;
    while ((match = regex.exec(text)) !== null) {
        found = true;
        const path = match[1];
        const content = match[2];
        const parts = path.split('/').filter(Boolean);
        const res = updateFileHelper(newFiles, parts, content);
        lastFileNode = res.fileNode;
    }

    if (found) {
        setFiles(newFiles);
        if (lastFileNode) {
            setSelectedFile(lastFileNode);
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1219] relative">
      <div className="px-4 md:px-6 py-4 border-b border-border bg-background shrink-0 z-10 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Instruction Input</span>
        <div className="text-[11px] font-medium text-primary md:hidden">Autonomous AI</div>
      </div>
      
      <ScrollArea className="flex-1 min-h-0 p-4 md:p-6" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary/10 border border-primary/30 rounded-xl rounded-tr-none text-white' 
                    : 'bg-accent/40 border border-border/50 rounded-xl rounded-tl-none text-slate-300'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                ) : (
                  <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0 break-words min-w-0">
                    {msg.content === '' && msg.isStreaming ? (
                       <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                       </div>
                    ) : (
                       <ReactMarkdown
                         remarkPlugins={[remarkGfm]}
                         components={{
                           li({node, children, checked, ...props}: any) {
                             if (checked !== undefined && checked !== null) {
                               return (
                                 <li className="task-list-item flex items-center" {...props}>
                                   <input type="checkbox" checked={checked} readOnly />
                                   <span className="flex-1">{children}</span>
                                 </li>
                               )
                             }
                             return <li {...props}>{children}</li>
                           },
                           pre({children, ...props}: any) {
                             return <>{children}</>
                           },
                           code({node, inline, className, children, ...props}: any) {
                             return <CodeBlock inline={inline} className={className} children={children} />
                           }
                         }}
                       >
                         {msg.content}
                       </ReactMarkdown>
                    )}
                    {msg.isStreaming && msg.content !== '' && (
                       <span className="inline-block w-1 h-3 ml-1 bg-primary animate-pulse align-middle" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 md:p-6 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new feature or change instructions..."
            className="w-full bg-muted border border-border rounded-xl p-4 pb-12 text-xs text-slate-300 h-24 resize-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 text-muted-foreground hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] bg-background/50 border border-transparent hover:border-border"
            >
              <Settings2 className="w-3.5 h-3.5" />
              {selectedProvider.name}
            </button>
            <button 
              type="button"
              onClick={() => setShowSnippets(!showSnippets)}
              className="p-1.5 text-muted-foreground hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] bg-background/50 border border-transparent hover:border-border"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Snippets ({snippets.length})
            </button>
            
            {showSettings && (
               <div className="absolute bottom-full left-0 md:left-0 mb-2 w-[calc(100vw-3rem)] md:w-64 max-w-64 bg-[#0d1117] border border-border rounded-lg shadow-xl p-4 z-50 flex flex-col gap-4">
                  <div className="flex justify-between items-center md:hidden">
                    <span className="text-xs font-bold text-white">LLM Settings</span>
                    <button onClick={() => setShowSettings(false)} className="text-muted-foreground"><X size={16} /></button>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Provider</label>
                    <select 
                       className="w-full bg-background border border-border rounded-lg p-2 text-xs text-white outline-none focus:border-primary appearance-none"
                       value={selectedProvider.id}
                       onChange={(e) => {
                          const p = PROVIDERS.find(x => x.id === e.target.value) || PROVIDERS[0];
                          setSelectedProvider(p);
                          setSelectedModel(p.models[0]);
                       }}
                    >
                       {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Model</label>
                    <select 
                       className="w-full bg-background border border-border rounded-lg p-2 text-xs text-white outline-none focus:border-primary appearance-none"
                       value={selectedModel}
                       onChange={(e) => setSelectedModel(e.target.value)}
                    >
                       {selectedProvider.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
               </div>
            )}

            {showSnippets && (
               <div className="absolute bottom-full left-0 md:left-auto md:right-0 mb-2 w-[calc(100vw-3rem)] md:w-56 max-h-64 overflow-y-auto bg-[#0d1117] border border-border rounded-lg shadow-xl p-2 z-50">
                  <div className="flex justify-between items-center p-2 border-b border-border mb-1 md:hidden">
                    <span className="text-xs font-bold text-white">Saved Snippets</span>
                    <button onClick={() => setShowSnippets(false)} className="text-muted-foreground"><X size={16} /></button>
                  </div>
                  {snippets.length === 0 ? (
                     <div className="p-4 text-xs text-muted-foreground text-center italic">No snippets saved yet. Click "Save" on code blocks in the chat.</div>
                  ) : (
                     snippets.map(s => (
                        <div key={s.id} className="flex items-center justify-between group p-1 hover:bg-muted/50 rounded">
                           <button 
                              type="button"
                              className="flex-1 text-left text-xs text-slate-300 px-2 py-1 truncate"
                              onClick={() => {
                                 setPreviewSnippet(s);
                                 setShowSnippets(false);
                              }}
                           >
                             {s.name}
                           </button>
                           <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSnippetToDelete(s.id);
                                setShowSnippets(false);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-400/10 rounded transition-opacity"
                           >
                              <Trash size={12} />
                           </button>
                        </div>
                     ))
                  )}
               </div>
            )}
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground hidden sm:inline">Press ⌘ + Enter to send</span>
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 w-8 h-8"
            >
              {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Snippet Modal */}
      {previewSnippet && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0d1117] border border-border rounded-xl w-full max-w-sm md:max-w-md flex flex-col shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border text-sm font-semibold text-white flex justify-between items-center bg-background/50">
              <span className="truncate mr-2">{previewSnippet.name}</span>
              <button onClick={() => setPreviewSnippet(null)} className="text-muted-foreground hover:text-white"><X size={16} /></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[50vh] md:max-h-[60vh] bg-[#0a0d14] text-xs font-mono text-slate-300 scrollbar-thin">
              <pre className="whitespace-pre-wrap">{previewSnippet.code}</pre>
            </div>
            <div className="px-4 py-4 border-t border-border flex justify-end gap-3 bg-background/50">
              <button 
                onClick={() => setPreviewSnippet(null)}
                className="px-4 py-2 text-xs text-muted-foreground hover:text-white transition-colors font-medium border border-transparent hover:border-border rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setInput(prev => prev + (prev.endsWith('\n') || prev === '' ? '' : '\n') + previewSnippet.code + '\n');
                  setPreviewSnippet(null);
                }}
                className="px-4 py-2 text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-bold shadow-lg shadow-primary/20"
              >
                Insert to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Snippet Modal */}
      {snippetToDelete && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0d1117] border border-border rounded-xl w-full max-w-xs flex flex-col shadow-2xl">
            <div className="px-4 py-3 border-b border-border text-sm font-semibold text-white">
              Delete Snippet?
            </div>
            <div className="p-4 text-xs text-slate-300">
              Are you sure you want to delete this snippet? This action cannot be undone.
            </div>
            <div className="px-4 py-3 border-t border-border flex justify-end gap-2">
              <button 
                onClick={() => setSnippetToDelete(null)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  removeSnippet(snippetToDelete);
                  setSnippetToDelete(null);
                }}
                className="px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
