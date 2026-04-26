import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore, Message } from '../store/agentStore';
import { chatWithNathanStream } from '../services/geminiService';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messages = useAgentStore(state => state.messages);
  const addMessage = useAgentStore(state => state.addMessage);
  const updateMessage = useAgentStore(state => state.updateMessage);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: input };
    addMessage(userMsg);
    setInput('');
    setIsTyping(true);

    const modelMsgId = crypto.randomUUID();
    addMessage({ id: modelMsgId, role: 'model', content: '', isStreaming: true });

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    try {
      let accumulatedText = "";
      const stream = chatWithNathanStream(input, history);
      
      for await (const chunk of stream) {
         accumulatedText += chunk;
         updateMessage(modelMsgId, accumulatedText, true);
      }
      
      // Finishing stream
      updateMessage(modelMsgId, accumulatedText, false);
      
      // Simulate file update based on agent output
      // (This is a mock behavior for the Vibe Architect effect)
      simulateFileUpdates(accumulatedText);

    } catch (error: any) {
      updateMessage(modelMsgId, `**Error**: ${error.message}`, false);
    } finally {
      setIsTyping(false);
    }
  };
  
  const simulateFileUpdates = (text: string) => {
     // A simple mock: if text contains "### Step 1", we just update a file to make UI look alive
     const setFiles = useAgentStore.getState().setFiles;
     const files = useAgentStore.getState().files;
     
     // Very naive simulator
     const newFiles = [...files];
     const srcFolder = newFiles.find(f => f.name === 'src');
     if (srcFolder && srcFolder.children) {
        const appTsx = srcFolder.children.find(f => f.name === 'App.tsx');
        if (appTsx) {
           appTsx.content = `// Updated by Nathan-coder\n// at ${new Date().toLocaleTimeString()}\n\nexport default function App() {\n  return <div>New Generated Content</div>;\n}`;
        }
     }
     setFiles(newFiles);
  }

  return (
    <div className="flex flex-col h-full bg-[#0F1219] relative">
      <div className="px-6 py-4 border-b border-border bg-background shrink-0 z-10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Instruction Input</span>
      </div>
      
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
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
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#0d1117] prose-pre:p-3 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-lg">
                    {msg.content === '' && msg.isStreaming ? (
                       <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                       </div>
                    ) : (
                       <ReactMarkdown>{msg.content}</ReactMarkdown>
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

      <div className="p-6 shrink-0">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new feature or change instructions..."
            className="w-full bg-muted border border-border rounded-xl p-4 text-xs text-slate-300 h-24 resize-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary shadow-none placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground">Press ⌘ + Enter to send</span>
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 w-7 h-7"
            >
              {isTyping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
