import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { OutletProvider } from './context/OutletContext';
import { CacheDataProvider } from './context/CacheDataContext';
import { NotificationProvider } from './context/NotificationContext';
import { QueryProvider } from './lib/react-query/provider';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <QueryProvider>
    <BrowserRouter>
      <AuthProvider>
        <OutletProvider>
          <CacheDataProvider>
            <NotificationProvider>
              <App />
            </NotificationProvider>
          </CacheDataProvider>
        </OutletProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryProvider>
); 