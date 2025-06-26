import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { OutletProvider } from './context/OutletContext';
import { CacheDataProvider } from './context/CacheDataContext';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import TestingEnvironmentBar from './components/TestingEnvironmentBar';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OutletProvider>
          <CacheDataProvider>
            <TestingEnvironmentBar />
            <App />
          </CacheDataProvider>
        </OutletProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
); 