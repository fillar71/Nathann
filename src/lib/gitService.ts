import { Volume, createFsFromVolume } from 'memfs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { useAgentStore, FileNode } from '../store/agentStore';

export const vol = new Volume();
const fs = createFsFromVolume(vol);

// Sync agentStore files -> memfs
export const syncToMemfs = () => {
  vol.reset();
  const writeDir = (nodes: FileNode[], currentPath: string) => {
    for (const node of nodes) {
      const fullPath = currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`;
      if (node.type === 'folder') {
        vol.mkdirSync(fullPath, { recursive: true });
        if (node.children) writeDir(node.children, fullPath);
      } else {
        const dirname = fullPath.substring(0, fullPath.lastIndexOf('/'));
        if (dirname && dirname !== '/') {
            vol.mkdirSync(dirname, { recursive: true });
        }
        vol.writeFileSync(fullPath, node.content || '');
      }
    }
  };
  const files = useAgentStore.getState().files;
  writeDir(files, '/');
};

// Sync memfs -> agentStore files
export const syncFromMemfs = () => {
  const readDir = (currentPath: string): FileNode[] => {
    try {
      const entries = vol.readdirSync(currentPath) as string[];
      const nodes: FileNode[] = [];
      for (const entry of entries) {
        if (entry === '.git') continue; // Skip .git folder
        
        const fullPath = currentPath === '/' ? `/${entry}` : `${currentPath}/${entry}`;
        const stat = vol.statSync(fullPath);
        
        if (stat.isDirectory()) {
          nodes.push({
            id: crypto.randomUUID(),
            name: entry,
            type: 'folder',
            isOpen: false,
            children: readDir(fullPath),
          });
        } else {
          const content = vol.readFileSync(fullPath, 'utf8') as string;
          nodes.push({
            id: crypto.randomUUID(),
            name: entry,
            type: 'file',
            content,
          });
        }
      }
      return nodes;
    } catch {
       return [];
    }
  };
  const newFiles = readDir('/');
  useAgentStore.getState().setFiles(newFiles);
};

export const gitOperations = {
  clone: async (url: string) => {
    vol.reset(); // clear before clone
    await git.clone({
      fs: fs as any,
      http,
      dir: '/',
      corsProxy: 'https://cors.isomorphic-git.org',
      url,
      singleBranch: true,
      depth: 1
    });
    syncFromMemfs();
  },
  
  commit: async (message: string, authorName: string, authorEmail: string) => {
    syncToMemfs();
    await git.add({ fs: fs as any, dir: '/', filepath: '.' });
    const sha = await git.commit({
      fs: fs as any,
      dir: '/',
      author: {
        name: authorName,
        email: authorEmail,
      },
      message
    });
    return sha;
  },

  push: async (url: string, token: string) => {
    syncToMemfs();
    const pushResult = await git.push({
      fs: fs as any,
      http,
      dir: '/',
      remote: 'origin',
      ref: 'main', // assuming main branch
      url,
      corsProxy: 'https://cors.isomorphic-git.org',
      onAuth: () => ({ username: token })
    });
    return pushResult;
  }
};
