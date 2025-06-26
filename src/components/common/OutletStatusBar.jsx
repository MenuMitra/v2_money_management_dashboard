import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useOutlet } from '../../context/OutletContext';

/**
 * Component to display a warning bar when outlet is inactive
 * Also adds a blur effect to the page content but not the header
 */
const OutletStatusBar = () => {
  const { currentOutlet } = useOutlet();
  
  // If no outlet selected or outlet is active, don't render anything
  if (!currentOutlet || currentOutlet.outlet_status) {
    return null;
  }

  return (
    <>
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
      
      {/* Overlay that adds blur effect to the page content but not the header */}
      <div className="fixed top-[140px] inset-x-0 bottom-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 max-w-md text-center -mt-20 ml-20">
          <FaExclamationTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Outlet Inactive</h3>
          <p className="text-gray-700">
            Cannot create or update data because the outlet is currently inactive. Please activate the outlet first.
          </p>
        </div>
      </div>
    </>
  );
};

export default OutletStatusBar; 