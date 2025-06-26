import React from 'react';
import { useOutlet } from '../context/OutletContext';

/**
 * Custom hook to get the current outlet ID
 * @returns {string|null} The current outlet ID or null if no outlet is selected
 */
export const useOutletId = () => {
  const { currentOutlet } = useOutlet();
  return currentOutlet ? currentOutlet.outlet_id : null;
};

/**
 * Custom hook to check if an outlet is selected
 * @returns {boolean} True if an outlet is selected, false otherwise
 */
export const useHasOutlet = () => {
  const { currentOutlet } = useOutlet();
  return Boolean(currentOutlet);
};

/**
 * Custom hook to get information whether we should show a "select outlet" warning
 * @returns {Object} Object containing hasOutlet and warningElement
 */
export const useOutletWarning = () => {
  const { currentOutlet } = useOutlet();
  const hasOutlet = Boolean(currentOutlet);
  
  const warningElement = !hasOutlet ? (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            No outlet is selected. Please select an outlet from the header to view data.
          </p>
        </div>
      </div>
    </div>
  ) : null;
  
  return { hasOutlet, warningElement };
}; 