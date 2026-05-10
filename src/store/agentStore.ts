import { create } from 'zustand';

export type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
};

export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
};

export type Snippet = {
  id: string;
  name: string;
  code: string;
};

interface AgentState {
  messages: Message[];
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, content: string, isStreaming?: boolean) => void;
  
  files: FileNode[];
  selectedFile: FileNode | null;
  setSelectedFile: (file: FileNode | null) => void;
  setFiles: (files: FileNode[]) => void;
  addFile: (parentId: string | null, node: FileNode) => void;
  renameFile: (id: string, newName: string) => void;
  deleteFile: (id: string) => void;
  toggleFolder: (id: string) => void;

  snippets: Snippet[];
  addSnippet: (snippet: Snippet) => void;
  removeSnippet: (id: string) => void;

  terminalOutput: string[];
  addTerminalOutput: (lines: string[]) => void;
  clearTerminal: () => void;
  pushFile: (pathParts: string[], content: string) => void;
}


const initialFiles: FileNode[] = [];

export const useAgentStore = create<AgentState>((set) => ({
  messages: [{
    id: 'welcome',
    role: 'model',
    content: `🚀 **Hello! I am Nathan-coder**, your **autonomous AI developer agent** with an enhanced workflow!

### 🎯 New Workflow Capabilities:
1. **Understand** your instructions comprehensively
2. **Create work plans** by breaking down complex tasks into smaller steps
3. **Execute tasks** one by one with precision
4. **Test code** and **fix errors** automatically
5. **Provide summaries** of completed work

### 🔧 What I Can Do:
- **Task Breakdown**: Automatically divide complex requests into manageable tasks
- **Step-by-Step Execution**: Process each task sequentially with progress updates
- **Automated Testing**: Run tests and fix errors without manual intervention
- **Work Summaries**: Provide detailed reports of completed work

### 💡 Example Instructions:
- *"Create a React component with TypeScript support"*
- *"Fix the authentication error in the login system"*
- *"Build a responsive navbar with dropdown menus"*
- *"Add form validation to the contact page"*

### 📝 How to Use:
1. Type your instruction in the chatbox
2. Watch me analyze, plan, and execute the tasks
3. Get a complete work summary when done

**Ready when you are!** What would you like me to build or fix today? 🚀`
  }],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateMessage: (id, content, isStreaming) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, content, isStreaming: isStreaming !== undefined ? isStreaming : m.isStreaming } : m)
  })),
  
  files: initialFiles,
  selectedFile: null,
  setSelectedFile: (file) => set({ selectedFile: file }),
  setFiles: (files) => set({ files }),

  addFile: (parentId, node) => set((state) => {
    const addNode = (nodes: FileNode[]): FileNode[] => {
      if (!parentId) return [...nodes, node];
      return nodes.map(n => {
        if (n.id === parentId && n.type === 'folder') {
          return { ...n, children: [...(n.children || []), node], isOpen: true };
        }
        if (n.children) {
          return { ...n, children: addNode(n.children) };
        }
        return n;
      });
    };
    return { files: addNode(state.files) };
  }),

  renameFile: (id, newName) => set((state) => {
    const renameNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(n => {
        if (n.id === id) return { ...n, name: newName };
        if (n.children) return { ...n, children: renameNode(n.children) };
        return n;
      });
    };
    const updatedFiles = renameNode(state.files);
    // Also update selected file if it's the one renamed
    const updatedSelectedFile = state.selectedFile?.id === id 
      ? { ...state.selectedFile, name: newName } 
      : state.selectedFile;

    return { files: updatedFiles, selectedFile: updatedSelectedFile };
  }),

  deleteFile: (id) => set((state) => {
    const deleteNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(n => n.id !== id).map(n => {
        if (n.children) return { ...n, children: deleteNode(n.children) };
        return n;
      });
    };
    const updatedFiles = deleteNode(state.files);
    const updatedSelectedFile = state.selectedFile?.id === id ? null : state.selectedFile;
    return { files: updatedFiles, selectedFile: updatedSelectedFile };
  }),

  toggleFolder: (id) => set((state) => {
    const toggleNode = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(n => {
        if (n.id === id) return { ...n, isOpen: !n.isOpen };
        if (n.children) return { ...n, children: toggleNode(n.children) };
        return n;
      });
    };
    return { files: toggleNode(state.files) };
  }),

  snippets: [],
  addSnippet: (snippet) => set((state) => ({ snippets: [...state.snippets, snippet] })),
  removeSnippet: (id) => set((state) => ({ snippets: state.snippets.filter(s => s.id !== id) })),

  terminalOutput: [
    'Welcome to the Nathan Workspace Terminal.',
    'Type "help" for a list of available commands.',
    'v8.0.0 > system ready'
  ],
  addTerminalOutput: (lines) => set((state) => ({ terminalOutput: [...state.terminalOutput, ...lines] })),
  clearTerminal: () => set({ terminalOutput: [] }),
  pushFile: (pathParts, content) => set((state) => {
    const newFiles = JSON.parse(JSON.stringify(state.files));
    const updateFileHelper = (tree: FileNode[], parts: string[], fileContent: string): { tree: FileNode[], fileNode: FileNode } => {
        const [currentPart, ...rest] = parts;
        if (rest.length === 0) {
            let existingFileIndex = tree.findIndex(f => f.name === currentPart && f.type === 'file');
            if (existingFileIndex >= 0) {
                tree[existingFileIndex].content = fileContent;
                return { tree, fileNode: tree[existingFileIndex] };
            } else {
                const newNode: FileNode = { id: crypto.randomUUID(), name: currentPart, type: 'file', content: fileContent };
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
            const res = updateFileHelper(tree[existingFolderIndex].children || [], rest, fileContent);
            tree[existingFolderIndex].children = res.tree;
            return { tree, fileNode: res.fileNode };
        }
    };
    const res = updateFileHelper(newFiles, pathParts, content);
    return { files: newFiles, selectedFile: res.fileNode };
  }),
}));
