import { useState, useRef, useEffect } from 'react';
import { useOutlet } from '../context/OutletContext';
import { useAuth } from '../context/AuthContext';
import OutletSelector from './OutletSelector';
import DateRangePicker from './DateRangePicker';

const OutletHeader = () => {
  const { currentOutlet, loading, updateCurrentOutlet } = useOutlet();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [dateRange, setDateRange] = useState({ type: 'all' });
  const profileRef = useRef(null);
  
  const role = localStorage.getItem('role') || 'User';
  const userName = localStorage.getItem('user_name') || 'User';

  // Handle clicks outside to close the logout dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectOutlet = (outlet) => {
    updateCurrentOutlet(outlet);
    // You could trigger a data reload here or dispatch an event
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Dispatch a custom event that components can listen for
    const event = new CustomEvent('daterange:changed', { detail: range });
    window.dispatchEvent(event);
  };

  const handleRefresh = () => {
    // Implement refresh logic here
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
  };

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  return (
    <div className="h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {/* Outlet selector button */}
          <button 
            onClick={handleOpenModal}
            className="flex items-center h-10 px-3 text-sm font-medium text-gray-700 focus:outline-none border border-gray-300 rounded-md bg-white hover:bg-gray-50 justify-between min-w-[150px] mr-3"
          >
            <div className="flex items-center">
              {loading ? (
                <span className="animate-pulse">Loading...</span>
              ) : currentOutlet ? (
                <span className="font-medium truncate">{currentOutlet.name}</span>
              ) : (
                <span>Select Outlet</span>
              )}
            </div>
            
            <svg className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Date Range Picker - only visible when outlet is selected */}
          {currentOutlet && (
            <div className="hidden md:block ml-4">
              <DateRangePicker onChange={handleDateRangeChange} initialValue="all" />
            </div>
          )}
        </div>
        
        {/* Right section with refresh button and profile */}
        <div className="flex items-center gap-3">
          {/* Refresh Button - only show when an outlet is selected */}
          {currentOutlet && (
            <button 
              onClick={handleRefresh}
              className="h-10 w-10 flex items-center justify-center rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none transition-colors border border-gray-300 hidden md:flex"
              title="Refresh"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          
          {/* Profile with Role - always visible */}
          <div 
            ref={profileRef}
            className="relative flex items-center h-10"
            onClick={toggleLogout}
          >
            <div className="flex items-center cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2">
                <span className="font-medium">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-sm hidden md:block">
                <p className="text-gray-700 font-medium">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
            </div>
            
            {/* Improved Logout button that appears on click */}
            {showLogout && (
              <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md py-1 z-50 border border-gray-200 w-32">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors focus:outline-none"
                >
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <OutletSelector 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSelect={handleSelectOutlet}
      />
    </div>
  );
};

export default OutletHeader; 