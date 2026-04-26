import React from 'react';
import { useAgentStore, FileNode } from '../store/agentStore';
import { Folder, File, ChevronRight, ChevronDown, TerminalSquare } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export default function Sidebar() {
  const files = useAgentStore(state => state.files);
  const selectedFile = useAgentStore(state => state.selectedFile);
  const setSelectedFile = useAgentStore(state => state.setSelectedFile);

  const renderFileTree = (nodes: FileNode[], padding = 12) => {
    return nodes.map(node => (
      <div key={node.id}>
        <div 
          className={`flex items-center gap-2 py-2.5 md:py-1.5 px-3 md:px-2 hover:bg-accent/50 cursor-pointer rounded-md transition-colors ${selectedFile?.id === node.id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}
          style={{ paddingLeft: `${node.type === 'folder' ? padding : padding + 18}px` }}
          onClick={() => {
            if (node.type === 'file') setSelectedFile(node);
          }}
        >
          {node.type === 'folder' ? (
            <>
              {node.isOpen ? <ChevronDown className="w-3.5 h-3.5 opacity-70" /> : <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
              <Folder className="w-4 h-4 text-blue-400" />
            </>
          ) : (
            <File className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-sm truncate select-none">{node.name}</span>
        </div>
        {node.type === 'folder' && node.isOpen && node.children && (
          <div className="flex flex-col">
            {renderFileTree(node.children, padding + 16)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-card h-full">
      <div className="p-4 md:p-6 flex items-center gap-3 border-b border-border shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shrink-0">N</div>
        <span className="text-lg font-semibold tracking-tight text-white truncate">Nathan-coder</span>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 mt-4 md:mt-6 px-4 shrink-0">Workspace</div>
      <ScrollArea className="flex-1 py-1 px-2">
         {renderFileTree(files)}
      </ScrollArea>
      <div className="p-4 mt-auto border-t border-border bg-card shrink-0">
        <div className="flex items-center gap-3 p-2 bg-background rounded-lg border border-border/50">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0">JD</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground truncate">John Doe</div>
            <div className="text-[10px] text-muted-foreground truncate">Pro Developer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
