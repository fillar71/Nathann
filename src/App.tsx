import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AgentApp from './components/AgentApp';
import { ThemeProvider } from './components/ThemeProvider';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nathan-theme">
      {currentView === 'landing' ? (
        <LandingPage onStart={() => setCurrentView('app')} />
      ) : (
        <AgentApp />
      )}
    </ThemeProvider>
  );
}
