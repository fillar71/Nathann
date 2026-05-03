import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Github, Mail } from 'lucide-react';

export default function AuthModal({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (isSignUp: boolean) => {
    setLoading(true);
    setError(null);
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) setError(error.message);
    else onSuccess();
    setLoading(false);
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setError(error.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 text-sm rounded bg-destructive/15 text-destructive">{error}</div>}
          
          <div className="space-y-2">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => handleEmailAuth(false)} disabled={loading}>
              Sign In
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => handleEmailAuth(true)} disabled={loading}>
              Sign Up
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => handleOAuth('github')}>
              <Github className="w-4 h-4 mr-2" />
              Github
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
