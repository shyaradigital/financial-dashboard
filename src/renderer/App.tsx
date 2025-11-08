import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import AuthScreen from './components/Auth/AuthScreen';
import MainLayout from './components/Layout/MainLayout';

const App: React.FC = () => {
  const { isAuthenticated, isLocked, setLocked, setModuleSettings, setProfile } = useAppStore();
  const [authRequired, setAuthRequired] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if authentication is required
    const checkAuth = async () => {
      const required = await window.electronAPI.checkAuthRequired();
      setAuthRequired(required);
    };

    checkAuth();

    // Listen for auto-lock events
    window.electronAPI.onAutoLock(() => {
      setLocked(true);
    });

    // Track user activity
    const handleActivity = () => {
      if (isAuthenticated && !isLocked) {
        window.electronAPI.userActivity();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [isAuthenticated, isLocked, setLocked]);

  useEffect(() => {
    // Load initial data when authenticated
    if (isAuthenticated && !isLocked) {
      loadInitialData();
    }
  }, [isAuthenticated, isLocked]);

  const loadInitialData = async () => {
    try {
      const [profile, moduleSettings] = await Promise.all([
        window.electronAPI.getProfile(),
        window.electronAPI.getModuleSettings()
      ]);
      
      setProfile(profile);
      setModuleSettings(moduleSettings);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  if (authRequired === null) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#0f0f0f',
        color: '#e0e0e0'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || isLocked) {
    return <AuthScreen isSetup={!authRequired} />;
  }

  return <MainLayout />;
};

export default App;


