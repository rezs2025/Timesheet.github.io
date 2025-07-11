import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { Toaster } from '@/shared/components/ui/sonner';
import { AuthProvider } from '@/shared/hooks/useAuth';

// Initialize deviceId in localStorage if it doesn't exist
if (!localStorage.getItem('deviceId')) {
  const deviceId = crypto.randomUUID();
  localStorage.setItem('deviceId', deviceId);
}

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root container missing in index.html");
}
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <TooltipProvider>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </React.StrictMode>
);