import React, { useMemo } from 'react';
import { useAgentStore, FileNode } from '../store/agentStore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Code2, MonitorPlay } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Sandpack } from '@codesandbox/sandpack-react';

export default function MainView() {
  const selectedFile = useAgentStore(state => state.selectedFile);
  const files = useAgentStore(state => state.files);

  const getLanguage = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.css')) return 'css';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.md')) return 'markdown';
    return 'javascript';
  };

  const sandpackFiles = useMemo(() => {
    const flattenFiles = (nodes: FileNode[], path: string = ''): Record<string, string> => {
      let result: Record<string, string> = {};
      nodes.forEach(node => {
        const currentPath = `${path}/${node.name}`;
        if (node.type === 'file' && node.content !== undefined) {
          result[currentPath] = node.content;
        } else if (node.type === 'folder' && node.children) {
          result = { ...result, ...flattenFiles(node.children, currentPath) };
        }
      });
      return result;
    };
    return flattenFiles(files);
  }, [files]);

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
        
        <TabsContent value="preview" className="flex-1 flex items-center justify-center m-0 bg-white min-h-0 overflow-hidden">
          {Object.keys(sandpackFiles).length > 0 ? (
            <div className="w-full h-full flex flex-col">
              <Sandpack
                template="react-ts"
                theme="dark"
                files={sandpackFiles}
                customSetup={{
                  dependencies: {
                    "lucide-react": "^0.344.0",
                    "tailwind-merge": "^2.2.1",
                    "clsx": "^2.1.0",
                    "framer-motion": "^11.0.8",
                    "@radix-ui/react-icons": "^1.3.0",
                    "date-fns": "^3.3.1"
                  }
                }}
                options={{
                  showNavigator: true,
                  showTabs: true,
                  editorHeight: "100%",
                  classes: {
                    "sp-layout": "h-full w-full !border-0 text-sm",
                    "sp-wrapper": "h-full w-full",
                    "sp-preview-container": "h-full w-full"
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center text-slate-500 flex flex-col items-center">
              <MonitorPlay className="w-12 h-12 mb-4 opacity-20 text-slate-800" />
              <p>No previewable code available yet. Start building!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
