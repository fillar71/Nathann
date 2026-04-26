import React from 'react';
import { useAgentStore } from '../store/agentStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, MonitorPlay } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export default function MainView() {
  const selectedFile = useAgentStore(state => state.selectedFile);

  if (!selectedFile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 border border-border/50">
          <Code2 className="w-8 h-8 opacity-50" />
        </div>
        <p className="text-sm font-medium">Select a file to view its contents</p>
      </div>
    );
  }

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.md')) return 'markdown';
    return 'javascript';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0d1117]">
      <Tabs defaultValue="code" className="flex-1 flex flex-col w-full h-full">
        <div className="h-10 bg-background border-b border-border flex items-center justify-between px-2 pr-2 md:pr-4 shrink-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#0d1117] text-slate-300 text-sm border-t-2 border-t-primary border-x border-x-border rounded-t-sm h-full truncate max-w-[50%] md:max-w-none">
            <span className="truncate">{selectedFile.name}</span>
          </div>
          <TabsList className="h-7 bg-muted/50 border border-border shrink-0">
            <TabsTrigger value="code" className="text-xs px-3 py-1 data-[state=active]:bg-[#0d1117]">Code</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs px-3 py-1 data-[state=active]:bg-[#0d1117]">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="code" className="flex-1 overflow-auto m-0 outline-none">
          <SyntaxHighlighter
            language={getLanguage(selectedFile.name)}
            style={vscDarkPlus}
            customStyle={{ margin: 0, padding: '1rem', background: '#0d1117', fontSize: '13px', minHeight: '100%' }}
            showLineNumbers={true}
            wrapLines={true}
          >
            {selectedFile.content || ''}
          </SyntaxHighlighter>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 flex items-center justify-center m-0 bg-white">
          <div className="text-center text-slate-500 flex flex-col items-center">
            <MonitorPlay className="w-12 h-12 mb-4 opacity-20 text-slate-800" />
            <p>Preview is not available in simulation mode.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
