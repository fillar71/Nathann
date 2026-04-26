import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import MainView from './MainView';
import ChatBox from './ChatBox';
import { Files, Code2, MessageSquare, Terminal as TerminalIcon, X, ChevronUp, ChevronDown } from 'lucide-react';

// Mock Terminal component
const Terminal = ({ onClose }: { onClose?: () => void }) => {
  const [output, setOutput] = useState<string[]>([
    'Welcome to the Nathan Workspace Terminal.',
    'Type "help" for a list of available commands.',
    'v8.0.0 > system ready'
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmedOutput = input.trim();
      let response = '';
      
      if (trimmedOutput === 'help') {
        response = 'Available commands: help, clear, echo, ping, date';
      } else if (trimmedOutput === 'clear') {
        setOutput([]);
        setInput('');
        return;
      } else if (trimmedOutput.startsWith('echo ')) {
        response = trimmedOutput.substring(5);
      } else if (trimmedOutput === 'ping') {
        response = 'pong';
      } else if (trimmedOutput === 'date') {
        response = new Date().toString();
      } else if (trimmedOutput === '') {
         // do nothing
      } else {
        response = `Command not found: ${trimmedOutput}`;
      }

      if(trimmedOutput !== '') {
          setOutput(prev => [...prev, `nathan-workspace % ${trimmedOutput}`, response].filter(Boolean));
      } else {
          setOutput(prev => [...prev, `nathan-workspace %`]);
      }
      
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-[#00ff00] font-mono text-xs w-full">
      <div className="flex justify-between items-center bg-[#1a1a1a] px-4 py-1 border-b border-[#333]">
         <div className="flex gap-2 items-center">
            <TerminalIcon size={12} className="text-gray-400" />
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Terminal</span>
         </div>
         {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
               <X size={14} />
            </button>
         )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        {output.map((line, i) => (
          <div key={i} className="mb-1 opacity-90 break-all">{line}</div>
        ))}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-blue-400">nathan-workspace % </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-[#00ff00] caret-white w-full min-w-0"
            autoFocus
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default function AgentApp() {
  const [mobileTab, setMobileTab] = useState<'files' | 'editor' | 'chat' | 'run'>('chat');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans select-none">
      
      {/* Main Content Area (Desktop: Row, Mobile: Column) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar - Desktop: Fixed, Mobile: Conditional */}
        <div className={`${mobileTab === 'files' ? 'flex w-full' : 'hidden'} md:flex md:w-64 shrink-0`}>
          <Sidebar />
        </div>

        <main className={`${mobileTab === 'files' ? 'hidden md:flex' : 'flex'} flex-1 flex-col min-w-0`}>
          {/* Header */}
          <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-8 bg-background shrink-0">
            <div className="flex items-center gap-2 md:gap-4">
              <h2 className="font-medium text-xs md:text-sm truncate">Project: <span className="text-primary">nathan-workspace</span></h2>
              <span className="hidden sm:inline-block px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20 uppercase">Synced</span>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">Agent: <span className="text-foreground font-mono">Standby</span></span>
              </div>
              <button className="px-3 py-1.5 md:px-4 md:py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded transition-colors whitespace-nowrap">Deploy</button>
            </div>
          </header>

          {/* Workspace Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
             <div className={`flex-1 flex overflow-hidden ${mobileTab === 'run' ? 'hidden md:flex' : ''}`}>
                <div className={`${mobileTab === 'editor' ? 'flex' : 'hidden'} md:flex flex-1 flex-col min-w-0 border-r border-border bg-[#0d1117]`}>
                  <MainView />
                </div>
                <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} w-full md:flex md:w-[420px] flex-shrink-0 flex-col bg-card z-10`}>
                  <ChatBox />
                </div>
             </div>
             
             {/* Collapsible Terminal Area */}
             <div 
               className={`flex-shrink-0 border-t border-border transition-all duration-300 ease-in-out flex flex-col
                  ${isTerminalOpen ? 'h-[250px] md:h-[300px]' : 'h-0 overflow-hidden'}
                  ${mobileTab === 'run' ? '!h-full !flex-1 border-t-0' : ''}
               `}
             >
                <Terminal onClose={() => {
                   setIsTerminalOpen(false);
                   if (mobileTab === 'run') setMobileTab('editor');
                }} />
             </div>
          </div>

          {/* Footer Info Bar */}
          <footer className="h-8 md:h-10 border-t border-border bg-background px-4 md:px-6 items-center justify-between shrink-0 hidden md:flex">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
               <button 
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className={`flex items-center gap-1 hover:text-white transition-colors px-2 py-1 rounded ${isTerminalOpen ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
               >
                  <TerminalIcon className="w-3 h-3" />
                  Terminal
                  {isTerminalOpen ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronUp className="w-3 h-3 ml-1" />}
               </button>
              <span className="flex items-center gap-1 ml-2">
                github.com/nathan-coder/workspace
              </span>
              <span className="flex items-center gap-1">Tests: All Passed</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-[10px] text-muted-foreground">
              <span>Runtime: V8 Active</span>
              <span className="w-px h-3 bg-border"></span>
              <span className="text-primary">Mode: Autonomous</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden flex items-center justify-around h-14 bg-[#0d1117] border-t border-border shrink-0 z-50">
        <button 
          onClick={() => { setMobileTab('files'); setIsTerminalOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${mobileTab === 'files' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Files className="w-5 h-5" />
          <span className="text-[10px] font-medium">Files</span>
        </button>
        <button 
          onClick={() => { setMobileTab('editor'); setIsTerminalOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${mobileTab === 'editor' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Code2 className="w-5 h-5" />
          <span className="text-[10px] font-medium">Editor</span>
        </button>
        <button 
          onClick={() => { setMobileTab('chat'); setIsTerminalOpen(false); }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${mobileTab === 'chat' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium">Chat</span>
        </button>
        <button 
          onClick={() => { setMobileTab('run'); }}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${mobileTab === 'run' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <TerminalIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium">Run</span>
        </button>
      </div>

    </div>
  );
}
