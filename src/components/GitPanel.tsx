import React, { useState } from 'react';
import { gitOperations } from '../lib/gitService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Github, DownloadCloud, UploadCloud, Save } from 'lucide-react';

export default function GitPanel() {
  const [repoUrl, setRepoUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [authorName, setAuthorName] = useState('Nathan-coder');
  const [authorEmail, setAuthorEmail] = useState('bot@nathan.dev');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const handleClone = async () => {
    if (!repoUrl) return;
    try {
      setLoading(true);
      addLog(`Cloning ${repoUrl}...`);
      await gitOperations.clone(repoUrl);
      addLog(`Clone successful!`);
    } catch (err: any) {
      addLog(`Clone failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage) return;
    try {
      setLoading(true);
      addLog(`Committing changes...`);
      const sha = await gitOperations.commit(commitMessage, authorName, authorEmail);
      addLog(`Committed successfully: ${sha.substring(0, 7)}`);
      setCommitMessage('');
    } catch (err: any) {
      addLog(`Commit failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!token) {
        addLog(`Push failed: Missing GitHub Token`);
        return;
    }
    if (!repoUrl) {
        addLog(`Push failed: Repo URL is required`);
        return;
    }
    try {
      setLoading(true);
      addLog(`Pushing to ${repoUrl}...`);
      await gitOperations.push(repoUrl, token);
      addLog(`Push successful!`);
    } catch (err: any) {
      addLog(`Push failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border flex items-center gap-2 shrink-0">
        <Github className="w-5 h-5 text-primary" />
        <span className="font-semibold text-white">Source Control</span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clone Repository</h3>
            <Input 
              placeholder="https://github.com/user/repo.git" 
              value={repoUrl} 
              onChange={e => setRepoUrl(e.target.value)} 
              className="bg-background/50 h-8"
              disabled={loading}
            />
            <Button onClick={handleClone} disabled={!repoUrl || loading} className="w-full h-8" size="sm" variant="secondary">
              <DownloadCloud className="w-4 h-4 mr-2" /> Clone
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commit Changes</h3>
            <Input 
              placeholder="Author Name" 
              value={authorName} 
              onChange={e => setAuthorName(e.target.value)} 
              className="bg-background/50 h-8 text-xs"
              disabled={loading}
            />
            <Input 
              placeholder="Author Email" 
              value={authorEmail} 
              onChange={e => setAuthorEmail(e.target.value)} 
              className="bg-background/50 h-8 text-xs"
              disabled={loading}
            />
            <Textarea 
              placeholder="Commit message..." 
              value={commitMessage} 
              onChange={e => setCommitMessage(e.target.value)}
              className="bg-background/50 min-h-[80px] resize-none text-sm"
              disabled={loading}
            />
            <Button onClick={handleCommit} disabled={!commitMessage || loading} className="w-full h-8" size="sm" variant="secondary">
              <Save className="w-4 h-4 mr-2" /> Commit
            </Button>
          </div>

          <div className="space-y-3">
             <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Push to Remote</h3>
             <Input 
                type="password"
                placeholder="Personal Access Token" 
                value={token} 
                onChange={e => setToken(e.target.value)} 
                className="bg-background/50 h-8 text-xs"
                disabled={loading}
             />
             <Button onClick={handlePush} disabled={!token || !repoUrl || loading} className="w-full h-8" size="sm">
                <UploadCloud className="w-4 h-4 mr-2" /> Push
             </Button>
          </div>
          
          {log.length > 0 && (
             <div className="mt-4 p-3 bg-black/40 rounded-md border border-border/50 font-mono text-[10px] text-muted-foreground space-y-1">
                 {log.map((l, i) => <div key={i}>{l}</div>)}
             </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
