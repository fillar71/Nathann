import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AgentApp from './components/AgentApp';
import { ThemeProvider } from './components/ThemeProvider';
import AuthModal from './components/AuthModal';
import { useAuthStore } from './store/authStore';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const { user, loading, initialize } = useAuthStore();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleStart = () => {
    if (user) {
      setCurrentView('app');
    } else {
      setShowAuth(true);
    }
  };

  if (loading) return null;

  return (
    <ThemeProvider defaultTheme="dark" storageKey="nathan-theme">
      {currentView === 'landing' ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <AgentApp />
      )}
      {showAuth && !user && <AuthModal onSuccess={() => { setShowAuth(false); setCurrentView('app'); }} />}
    </ThemeProvider>
  );
}
