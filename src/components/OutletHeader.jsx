import { useState, useRef, useEffect } from 'react';
import { useOutlet } from '../context/OutletContext';
import { useAuth } from '../context/AuthContext';
import OutletSelector from './OutletSelector';
import DateRangePicker from './DateRangePicker';
import { useLocation } from 'react-router-dom';

const OutletHeader = () => {
  const { currentOutlet, loading, updateCurrentOutlet, clearCurrentOutlet } = useOutlet();
  const { logout, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [dateRange, setDateRange] = useState({ type: 'all' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  
  const role = localStorage.getItem('role') || 'User';
  const userName = localStorage.getItem('user_name') || 'User';
  const userId = localStorage.getItem('user_id');
  
  // Store the current user ID to detect changes
  const userIdRef = useRef(userId);

  // Check if current page is Statistics
  const isStatisticsPage = location.pathname === '/statistics';

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
  
  // Check if the user ID has changed (indicating a login with a different user)
  useEffect(() => {
    const currentUserId = localStorage.getItem('user_id');
    
    // If user ID changed, clear the outlet selection
    if (userIdRef.current !== currentUserId) {
      console.log('User changed, clearing outlet selection');
      clearCurrentOutlet();
      userIdRef.current = currentUserId;
    }
  }, [user, clearCurrentOutlet]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectOutlet = (outlet) => {
    updateCurrentOutlet(outlet);
    // Reset date range to 'all' when outlet changes
    setDateRange({ type: 'all' });
    
    // Dispatch an event to notify other components that the outlet has changed
    const event = new CustomEvent('outlet:changed', { detail: outlet });
    window.dispatchEvent(event);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Dispatch a custom event that components can listen for
    const event = new CustomEvent('daterange:changed', { detail: range });
    window.dispatchEvent(event);
  };

  const handleRefresh = () => {
    // Start the refresh animation
    setIsRefreshing(true);
    
    // Implement refresh logic here
    window.location.reload();
    
    // Note: The page will reload, so we don't need to reset isRefreshing
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
            className="flex items-center h-9 px-3 text-sm font-medium text-gray-700 focus:outline-none border border-gray-300 rounded-md bg-white hover:bg-gray-50 justify-between min-w-[150px] mr-3"
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
        
          {/* Date Range Picker - always visible when outlet is selected but only enabled on Statistics page */}
        {currentOutlet && (
            <div className="hidden md:block ml-4">
            <DateRangePicker 
              onChange={isStatisticsPage ? handleDateRangeChange : undefined} 
              initialValue="all" 
              disabled={!isStatisticsPage}
            />
          </div>
        )}
      </div>
      
        {/* Right section with refresh button and profile */}
        <div className="flex items-center gap-3 h-9">
          {/* Refresh Button - only show when an outlet is selected and only on desktop */}
        {currentOutlet && (
        <button 
          onClick={handleRefresh}
              className="group h-9 w-9 flex items-center justify-center rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:outline-none border border-gray-300 hidden md:flex"
          title="Refresh"
          disabled={isRefreshing}
        >
              <svg 
                className={`h-4 w-4 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
        </button>
          )}
        
          {/* Profile with Role - always visible */}
        <div 
          ref={profileRef}
            className="relative flex items-center h-9"
          onClick={toggleLogout}
        >
          <div className="flex flex-row items-center cursor-pointer">
              <div className="text-sm hidden md:block mr-2">
                <p className="text-gray-700 font-medium leading-tight">{userName}</p>
                <p className="text-xs text-gray-500 capitalize leading-tight">{role}</p>
              </div>
              <div className="md:h-7 md:w-7 h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
                {/* Show initial on mobile, icon on desktop */}
                <span className="font-medium md:hidden">{userName.charAt(0).toUpperCase()}</span>
                <svg className="h-4 w-4 hidden md:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-sm md:hidden ml-2">
                <p className="text-gray-700 font-medium leading-tight">{userName}</p>
                <p className="text-xs text-gray-500 capitalize leading-tight">{role}</p>
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