import React, { useState } from 'react';
import { useAgentStore, FileNode } from '../store/agentStore';
import { Folder, File, ChevronRight, ChevronDown, Plus, FolderPlus, Edit2, Trash2, X, Check, GitCommit } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import GitPanel from './GitPanel';

export default function Sidebar() {
  const files = useAgentStore(state => state.files);
  const selectedFile = useAgentStore(state => state.selectedFile);
  const setSelectedFile = useAgentStore(state => state.setSelectedFile);
  const addFile = useAgentStore(state => state.addFile);
  const renameFile = useAgentStore(state => state.renameFile);
  const deleteFile = useAgentStore(state => state.deleteFile);
  const toggleFolder = useAgentStore(state => state.toggleFolder);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [addingToId, setAddingToId] = useState<{ id: string | null, type: 'file' | 'folder' } | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'git'>('files');

  const handleCreate = (parentId: string | null) => {
    if (!newName.trim() || !addingToId) return;
    
    const newNode: FileNode = {
      id: crypto.randomUUID(),
      name: newName,
      type: addingToId.type,
      isOpen: addingToId.type === 'folder',
      children: addingToId.type === 'folder' ? [] : undefined,
      content: addingToId.type === 'file' ? '' : undefined
    };

    addFile(parentId, newNode);
    setAddingToId(null);
    setNewName('');
  };

  const handleRename = (id: string) => {
    if (!newName.trim()) {
      setRenamingId(null);
      return;
    }
    renameFile(id, newName);
    setRenamingId(null);
    setNewName('');
  };

  const renderFileTree = (nodes: FileNode[], padding = 12) => {
    return (
      <div className="flex flex-col">
        {addingToId?.id === null && nodes === files && (
           <div className="flex items-center gap-2 py-1.5 px-2 mb-1 bg-accent/30 rounded-md" style={{ paddingLeft: `${padding}px` }}>
              {addingToId.type === 'folder' ? <Folder className="w-4 h-4 text-blue-400" /> : <File className="w-4 h-4 text-slate-400" />}
              <input 
                autoFocus
                className="bg-transparent border-none outline-none text-sm text-white w-full h-5"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate(null);
                  if (e.key === 'Escape') setAddingToId(null);
                }}
                onBlur={() => setAddingToId(null)}
              />
           </div>
        )}
        {nodes.map(node => (
          <div key={node.id} className="group/item">
            <div 
              className={`flex items-center gap-2 py-2.5 md:py-1.5 px-3 md:px-2 hover:bg-accent/50 cursor-pointer rounded-md transition-all group ${selectedFile?.id === node.id ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'}`}
              style={{ paddingLeft: `${node.type === 'folder' ? padding : padding + 18}px` }}
              onClick={(e) => {
                e.stopPropagation();
                if (node.type === 'folder') {
                  toggleFolder(node.id);
                } else {
                  setSelectedFile(node);
                }
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
              
              {renamingId === node.id ? (
                <input 
                  autoFocus
                  className="bg-background/50 border border-primary/50 rounded px-1 outline-none text-sm text-white w-full h-5"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(node.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onBlur={() => handleRename(node.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm truncate select-none flex-1">{node.name}</span>
              )}

              {renamingId !== node.id && (
                <div className="hidden group-hover:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {node.type === 'folder' && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAddingToId({ id: node.id, type: 'file' }); setNewName(''); toggleFolder(node.id); }}
                        className="p-1 hover:bg-background/80 rounded transition-colors text-muted-foreground hover:text-white"
                        title="New File"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAddingToId({ id: node.id, type: 'folder' }); setNewName(''); toggleFolder(node.id); }}
                        className="p-1 hover:bg-background/80 rounded transition-colors text-muted-foreground hover:text-white"
                        title="New Folder"
                      >
                        <FolderPlus size={14} />
                      </button>
                    </>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setRenamingId(node.id); setNewName(node.name); }}
                    className="p-1 hover:bg-background/80 rounded transition-colors text-muted-foreground hover:text-white"
                    title="Rename"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${node.name}?`)) deleteFile(node.id); }}
                    className="p-1 hover:bg-background/80 rounded transition-colors text-muted-foreground hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {node.type === 'folder' && node.isOpen && (
              <div className="flex flex-col">
                {addingToId?.id === node.id && (
                  <div className="flex items-center gap-2 py-1.5 px-2 mb-1 bg-accent/30 rounded-md" style={{ paddingLeft: `${padding + 16}px` }}>
                    {addingToId.type === 'folder' ? <Folder className="w-4 h-4 text-blue-400" /> : <File className="w-4 h-4 text-slate-400" />}
                    <input 
                      autoFocus
                      className="bg-transparent border-none outline-none text-sm text-white w-full h-5"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate(node.id);
                        if (e.key === 'Escape') setAddingToId(null);
                      }}
                      onBlur={() => handleCreate(node.id)}
                    />
                  </div>
                )}
                {node.children && renderFileTree(node.children, padding + 16)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-card h-full">
      <div className="p-4 md:p-6 flex items-center gap-3 border-b border-border shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shrink-0">N</div>
        <span className="text-lg font-semibold tracking-tight text-white truncate">Nathan-coder</span>
      </div>
      
      <div className="flex bg-muted/30 p-1 mx-4 mt-4 rounded-lg">
        <button 
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'files' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('files')}
        >
          <File size={14} /> Files
        </button>
        <button 
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === 'git' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setActiveTab('git')}
        >
          <GitCommit size={14} /> Git
        </button>
      </div>

      {activeTab === 'files' ? (
        <>
          <div className="flex items-center justify-between px-4 mt-6 mb-2 shrink-0">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Workspace</div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => { setAddingToId({ id: null, type: 'file' }); setNewName(''); }}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-white transition-colors"
                title="New File"
              >
                <Plus size={14} />
              </button>
              <button 
                onClick={() => { setAddingToId({ id: null, type: 'folder' }); setNewName(''); }}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-white transition-colors"
                title="New Folder"
              >
                <FolderPlus size={14} />
              </button>
            </div>
          </div>

          <ScrollArea className="flex-1 py-1 px-2">
            {renderFileTree(files)}
          </ScrollArea>
        </>
      ) : (
        <div className="flex-1 overflow-hidden mt-4">
          <GitPanel />
        </div>
      )}

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
