import React, { useState } from 'react';
import { useOutlet } from '../../context/OutletContext';
import OutletSelector from '../OutletSelector';

/**
 * A button component for selecting outlets
 * Can be placed anywhere in the app
 */
const OutletSelectButton = ({ buttonText = "Select Outlet", className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentOutlet, updateCurrentOutlet } = useOutlet();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectOutlet = (outlet) => {
    updateCurrentOutlet(outlet);
    // You could trigger a data reload here
  };

  return (
    <>
      <button 
        onClick={handleOpenModal}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${className}`}
      >
        <svg 
          className="-ml-1 mr-2 h-5 w-5 text-gray-500" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
        
        {currentOutlet ? (
          <div className="flex items-center">
            <span className="font-medium">{currentOutlet.name}</span>
            {currentOutlet.outlet_code && (
              <span className="ml-2 text-xs font-medium text-primary-600">
                #{currentOutlet.outlet_code}
              </span>
            )}
            <span className={`ml-2 inline-flex px-2 text-xs rounded-full font-medium ${
              currentOutlet.is_open 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {currentOutlet.is_open ? 'Open' : 'Closed'}
            </span>
          </div>
        ) : (
          <span>Select Outlet</span>
        )}
        
        <svg className="h-5 w-5 text-gray-400 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <OutletSelector 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleSelectOutlet}
      />
    </>
  );
};

export default OutletSelectButton; 