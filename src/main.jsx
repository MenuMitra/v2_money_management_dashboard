import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { OutletProvider } from './context/OutletContext';
import { CacheDataProvider } from './context/CacheDataContext';
import { NotificationProvider } from './context/NotificationContext';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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
  </React.StrictMode>,
); 