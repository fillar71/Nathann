import React from 'react';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Bot, Terminal, ShieldAlert, GitBranch, ArrowRight, Github } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 sticky top-0">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary shrink-0" />
            <span className="font-semibold text-lg tracking-tight">Nathan-coder</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <Github className="w-5 h-5" />
            </a>
            <Button onClick={onStart} className="rounded-full">Start Coding</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border/50 text-xs font-medium mb-6">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Nathan is online and ready
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-8">
              The autonomous AI <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">software engineer.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Describe your idea, and Nathan will plan, write, debug, and deploy your entire application. Just prompt and let the agent do the heavy lifting.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={onStart} className="rounded-full h-12 px-8 text-base">
                Try Nathan Now <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 bg-muted/30 border-y border-border/40">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Core Capabilities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Nathan is equipped with everything needed to build production-ready applications from scratch.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Terminal className="w-6 h-6 text-blue-400" />}
                title="Autonomous Execution"
                description="Nathan breaks down your prompt into atomic steps and executes them systematically, checking output at each stage."
              />
              <FeatureCard 
                icon={<ShieldAlert className="w-6 h-6 text-red-400" />}
                title="Self-Healing Code"
                description="When errors occur, Nathan detects them, searches for fixes, and retries up to 3 times autonomously before seeking help."
              />
              <FeatureCard 
                icon={<GitBranch className="w-6 h-6 text-green-400" />}
                title="GitHub Integration"
                description="Seamlessly pushes code to your repositories, handles branching, and creates structured pull requests for review."
              />
            </div>
          </div>
        </section>
        
        {/* Showcase / UI preview mockup */}
        <section className="py-24 px-6">
           <div className="max-w-5xl mx-auto rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden flex flex-col">
             <div className="h-10 border-b border-border/50 bg-muted/50 flex items-center px-4 gap-2">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-500/80" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                 <div className="w-3 h-3 rounded-full bg-green-500/80" />
               </div>
               <div className="ml-4 text-xs text-muted-foreground font-mono">nathan-workspace</div>
             </div>
             <div className="p-8 flex flex-col items-center justify-center min-h-[400px] bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3')] bg-cover bg-center relative">
               <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
               <div className="relative z-10 w-full max-w-2xl bg-card border border-border/50 rounded-lg p-6 shadow-xl">
                 <div className="flex gap-4 items-start mb-6">
                   <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                     <Bot className="w-5 h-5 text-primary-foreground" />
                   </div>
                   <div className="bg-muted p-4 rounded-lg rounded-tl-none">
                     <p className="text-sm font-medium mb-2">I have finished building your e-commerce platform.</p>
                     <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                       <li>Set up Next.js App Router & Tailwind CSS</li>
                       <li>Configured Supabase Auth & Database schema</li>
                       <li>Implemented product catalog and shopping cart</li>
                       <li>Fixed 2 rendering errors during build</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 px-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Nathan-coder. Vibe Architect Edition.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card border-border/50 shadow-sm transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
