import { createContext, useState, useContext, useEffect } from 'react';

// Create the outlet context
export const OutletContext = createContext();

// Custom hook for using the outlet context
export const useOutlet = () => {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error('useOutlet must be used within an OutletProvider');
  }
  return context;
};

// Outlet provider component
export const OutletProvider = ({ children }) => {
  // Initialize currentOutlet state from localStorage
  const [currentOutlet, setCurrentOutlet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize the outlet state from localStorage on mount
  useEffect(() => {
    const outletId = localStorage.getItem('outlet_id');
    
    if (outletId) {
      setCurrentOutlet({
        outlet_id: outletId,
        name: localStorage.getItem('outlet_name') || 'Unknown Outlet',
        outlet_code: localStorage.getItem('outlet_code') || '',
        address: localStorage.getItem('outlet_address') || '',
        outlet_status: localStorage.getItem('outlet_status') === 'active',
        is_open: localStorage.getItem('outlet_is_open') === 'open'
      });
    }
    setLoading(false);
  }, []);
  
  // Listen for cache:clear event (e.g., on logout)
  useEffect(() => {
    const handleCacheClear = () => {
      console.log('Clearing outlet context data due to logout');
      clearCurrentOutlet();
      setLoading(false);
    };
    
    window.addEventListener('cache:clear', handleCacheClear);
    
    return () => {
      window.removeEventListener('cache:clear', handleCacheClear);
    };
  }, []);

  // Update the current outlet
  const updateCurrentOutlet = (outlet) => {
    if (!outlet) return;
    
    // Store in localStorage
    localStorage.setItem('outlet_id', outlet.outlet_id);
    localStorage.setItem('outlet_name', outlet.name || '');
    localStorage.setItem('outlet_code', outlet.outlet_code || '');
    localStorage.setItem('outlet_address', outlet.address || '');
    localStorage.setItem('outlet_status', outlet.outlet_status ? 'active' : 'inactive');
    localStorage.setItem('outlet_is_open', outlet.is_open ? 'open' : 'closed');
    
    // Update state
    setCurrentOutlet(outlet);
  };

  // Clear the current outlet
  const clearCurrentOutlet = () => {
    localStorage.removeItem('outlet_id');
    localStorage.removeItem('outlet_name');
    localStorage.removeItem('outlet_code');
    localStorage.removeItem('outlet_address');
    localStorage.removeItem('outlet_status');
    localStorage.removeItem('outlet_is_open');
    
    setCurrentOutlet(null);
  };

  // Context value
  const outletContextValue = {
    currentOutlet,
    loading,
    updateCurrentOutlet,
    clearCurrentOutlet
  };

  return (
    <OutletContext.Provider value={outletContextValue}>
      {children}
    </OutletContext.Provider>
  );
}; 