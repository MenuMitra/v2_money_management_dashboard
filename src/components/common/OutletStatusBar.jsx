import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaWifi } from 'react-icons/fa';
import { useOutlet } from '../../context/OutletContext';


/**
 * Component to display a warning bar when outlet is inactive or in offline mode
 * Also adds a blur effect to the page content but not the header
 */
const OutletStatusBar = () => {
  const { currentOutlet } = useOutlet();
  const [offlineError, setOfflineError] = useState(null);
  
  // Listen for offline mode errors
  useEffect(() => {
    const handleOfflineError = (event) => {
      const { error } = event.detail;
      if (error?.response?.data?.detail?.includes('offline mode') || 
          error?.response?.data?.detail?.includes('This operation is not allowed in offline mode')) {
        setOfflineError(error.response.data.detail);
      }
    };

    // Listen for custom offline error events
    window.addEventListener('offline:error', handleOfflineError);
    
    // Also check for offline errors in console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      
      // Check if the error is related to offline mode
      const errorString = args.join(' ');
      if (errorString.includes('offline mode') || 
          errorString.includes('This operation is not allowed in offline mode')) {
        setOfflineError('This operation is not allowed in offline mode. Please switch outlet to online mode.');
      }
    };

    return () => {
      window.removeEventListener('offline:error', handleOfflineError);
      console.error = originalConsoleError;
    };
  }, []);

  // Listen for outlet changes to close offline error modal
  useEffect(() => {
    const handleOutletChange = () => {
      // Close the offline error modal when outlet changes
      setOfflineError(null);
    };

    window.addEventListener('outlet:changed', handleOutletChange);
    
    return () => {
      window.removeEventListener('outlet:changed', handleOutletChange);
    };
  }, []);

  // If no outlet selected, outlet is active, and no offline error, don't render anything
  if ((!currentOutlet || currentOutlet.outlet_status) && !offlineError) {
    return null;
  }

  // Determine what to display based on the error type
  const isOfflineMode = !!offlineError;
  const isInactiveOutlet = currentOutlet && !currentOutlet.outlet_status;

  return (
    <>
      {/* Warning bar */}
      {isOfflineMode ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mx-4 my-2 rounded-md shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaWifi className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                Outlet is currently in offline mode. Some operations are not available.
              </p>
            </div>
          </div>
        </div>
      ) : isInactiveOutlet ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mx-4 my-2 rounded-md shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                This outlet is currently marked as inactive. Some features may be limited.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Overlay that adds blur effect to the page content but not the header */}
      <div className="fixed top-[140px] inset-x-0 bottom-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 max-w-md text-center -mt-20 ml-20">
          {isOfflineMode ? (
            <>
              <FaWifi className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Outlet Offline</h3>
              <p className="text-gray-700 mb-4">
                {offlineError}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Please select a different outlet from the header or change the current outlet to online mode.
              </p>
              <button
                onClick={() => {
                  // Don't close the modal, just trigger outlet selector to open
                  window.dispatchEvent(new CustomEvent('open:outlet:selector'));
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-3xl hover:bg-blue-700 transition-colors"
              >
                Change Outlet
              </button>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Outlet Inactive</h3>
              <p className="text-gray-700">
                Cannot create or update data because the outlet is currently inactive. Please activate the outlet first.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OutletStatusBar; 