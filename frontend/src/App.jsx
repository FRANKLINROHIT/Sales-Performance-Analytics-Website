import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './layouts/MainLayout';

const AppContent = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ background: '#0b0f19', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading portal...</div>;
  }

  return token ? <MainLayout /> : <LoginPage />;
};

export function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
