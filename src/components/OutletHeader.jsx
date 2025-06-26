import { useState, useRef, useEffect } from 'react';
import { useOutlet } from '../context/OutletContext';
import { useAuth } from '../context/AuthContext';
import OutletSelector from './OutletSelector';

const OutletHeader = () => {
  const { currentOutlet, loading, updateCurrentOutlet } = useOutlet();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
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
    <div className="bg-white py-3  px-4 flex flex-wrap justify-between items-center">
      <div className="flex items-center">
        <button 
          onClick={handleOpenModal}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none flex items-center"
        >
          <svg className="h-5 w-5 text-gray-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          
          {loading ? (
            <span className="animate-pulse">Loading...</span>
          ) : currentOutlet ? (
            <div className="flex items-center">
              <span className="font-medium">{currentOutlet.name}</span>
            </div>
          ) : (
            <span>Select Outlet</span>
          )}
          
          <svg className="h-5 w-5 text-gray-400 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 hidden md:block">
        {/* Middle area of header */}
      </div>
      
      <div className="flex items-center space-x-4 ml-auto">
        {/* Refresh Button with Border */}
        <button 
          onClick={handleRefresh}
          className="p-2 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 focus:outline-none transition-colors border border-gray-300"
          title="Refresh"
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Profile with Role */}
        <div 
          ref={profileRef}
          className="relative flex items-center"
          onClick={toggleLogout}
        >
          <div className="flex items-center cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center mr-2">
              <span className="font-medium">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="text-sm hidden sm:block">
              <p className="text-gray-700 font-medium">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
          
          {/* Improved Logout button that appears on click */}
          {showLogout && (
            <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md py-1 z-10 border border-gray-200 w-32">
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
      
      <OutletSelector 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onSelect={handleSelectOutlet}
      />
    </div>
  );
};

export default OutletHeader; 