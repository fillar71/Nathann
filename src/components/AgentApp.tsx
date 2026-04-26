import React from 'react';
import Sidebar from './Sidebar';
import MainView from './MainView';
import ChatBox from './ChatBox';

export default function AgentApp() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans select-none">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-medium text-sm">Project: <span className="text-primary">nathan-workspace</span></h2>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20 uppercase">Synced to GitHub</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Agent: <span className="text-foreground font-mono">Standby</span></span>
            </div>
            <button className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded transition-colors">Deploy to Prod</button>
          </div>
        </header>

        {/* Workspace Area */}
        <div className="flex-1 flex overflow-hidden bg-background">
          <div className="flex-1 flex flex-col min-w-0 border-r border-border bg-[#0d1117]">
            <MainView />
          </div>
          <div className="w-[420px] flex-shrink-0 flex flex-col bg-card z-10">
            <ChatBox />
          </div>
        </div>

        {/* Footer Info Bar */}
        <footer className="h-10 border-t border-border bg-background px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> 
              github.com/nathan-coder/workspace
            </span>
            <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> Tests: All Passed</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Runtime: V8 Active</span>
            <span className="w-px h-3 bg-border"></span>
            <span className="text-primary">Mode: Autonomous</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
