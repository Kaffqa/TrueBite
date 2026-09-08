import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { NutritionProvider } from '@/contexts/NutritionContext';
import App from '@/App';
import '@/styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NutritionProvider>
          <App />
        </NutritionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);