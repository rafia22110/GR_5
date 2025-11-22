
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DevOpsInterface from './components/DevOpsInterface';
import AuthScreen from './components/AuthScreen';
import SubscriptionScreen from './components/SubscriptionScreen';
import { AppMode } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DevOps);
  const { user, plan } = useAuth();

  const renderContent = () => {
    // We only have one mode now: DevOps
    return <DevOpsInterface />;
  };

  if (!user) {
    return <AuthScreen />;
  }

  if (!plan) {
    return <SubscriptionScreen />;
  }

  return (
    <div className="flex h-screen w-screen bg-gemini-bg overflow-hidden text-gray-200">
      <Sidebar currentMode={mode} onModeChange={setMode} />
      <main className="flex-1 relative">
        {renderContent()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
