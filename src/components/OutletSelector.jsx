import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { COMMON_PREFIX } from '../api/axios';
import { useCacheData } from '../context/CacheDataContext';

/**
 * OutletSelector component for outlet dashboard
 * Allows users to select outlets from a modal
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to call when modal is closed
 * @param {function} onSelect - Function to call when outlet is selected
 * @param {boolean} updateContextOnSelect - Whether to update localStorage with selected outlet (true for header, false for comparison)
 * @param {array} excludedOutletIds - Array of outlet IDs to exclude from selection
 */
const OutletSelector = ({ isOpen, onClose, onSelect, updateContextOnSelect = true, excludedOutletIds = [] }) => {
  const modalRef = useRef(null);
  const [outlets, setOutlets] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const { fetchData, getCachedData, generateCacheKey } = useCacheData();
  
  // Add lastFetchTimestamp ref to track when data was last fetched
  const lastFetchTimestampRef = useRef(null);
  
  // Define cache duration (15 minutes in milliseconds)
  const CACHE_DURATION = 15 * 60 * 1000;
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [accountFilter, setAccountFilter] = useState('all'); // 'all', 'live', 'test'
  const [openFilter, setOpenFilter] = useState('all'); // 'all', 'open', 'closed'
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'asc', 'desc'
  
  // Check if any filter is active
  const isAnyFilterActive = statusFilter !== 'all' || 
                            accountFilter !== 'all' || 
                            openFilter !== 'all' || 
                            sortOrder !== 'default' ||
                            searchTerm.trim() !== '';
  
  // Listen for cache:clear event (e.g., on logout)
  useEffect(() => {
    const handleCacheClear = () => {
      console.log('Clearing outlet selector data due to logout');
      setOutlets([]);
      setFilteredOutlets([]);
      lastFetchTimestampRef.current = null;
    };
    
    window.addEventListener('cache:clear', handleCacheClear);
    
    return () => {
      window.removeEventListener('cache:clear', handleCacheClear);
    };
  }, []);

  // Fetch outlets when component mounts or modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOutlets();
    }
  }, [isOpen]);

  // Apply filters and search when any filtering condition changes
  useEffect(() => {
    if (!outlets || outlets.length === 0) return;
    
    let filtered = [...outlets];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(outlet => {
        return (
          (outlet.name && outlet.name.toLowerCase().includes(searchTermLower)) ||
          (outlet.outlet_code && outlet.outlet_code.toLowerCase().includes(searchTermLower)) ||
          (outlet.address && outlet.address.toLowerCase().includes(searchTermLower)) ||
          (outlet.owner_name && outlet.owner_name.toLowerCase().includes(searchTermLower))
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(outlet => {
        return statusFilter === 'active' ? Boolean(outlet.outlet_status) : !Boolean(outlet.outlet_status);
      });
    }
    
    // Apply account type filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(outlet => {
        return outlet.account_type === accountFilter;
      });
    }
    
    // Apply open filter
    if (openFilter !== 'all') {
      filtered = filtered.filter(outlet => {
        return openFilter === 'open' ? Boolean(outlet.is_open) : !Boolean(outlet.is_open);
      });
    }
    
    // Apply sorting
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }
    
    setFilteredOutlets(filtered);
  }, [searchTerm, outlets, statusFilter, accountFilter, openFilter, sortOrder]);

  // Helper function to title case text
  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Process outlet data to remove duplicates with same outlet_id
  const processOutletData = (outlets) => {
    // Create a map to keep track of outlets by ID
    const uniqueOutletsMap = new Map();
    
    // Process each outlet, keeping only the first occurrence of each outlet_id
    outlets.forEach(outlet => {
      const outletId = outlet.outlet_id;
      
      // Only add this outlet if we haven't seen this outlet_id before
      if (!uniqueOutletsMap.has(outletId)) {
        uniqueOutletsMap.set(outletId, {
          ...outlet,
          uniqueKey: `${outletId}`,
          is_open: Boolean(outlet.is_open),
          outlet_status: Boolean(outlet.outlet_status)
        });
      }
    });
    
    // Convert the map values back to an array
    return Array.from(uniqueOutletsMap.values());
  };

  // Fetch outlets from API with caching
  const fetchOutlets = async () => {
    try {
      setError(null);
      
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const requestBody = {
        owner_id: Number(userId),
        app_source: 'admin'
      };
      
      // Generate cache key
      const cacheKey = generateCacheKey(`${COMMON_PREFIX}/get_outlet_list`, requestBody);
      
      // Check for cached data first and display it immediately if available
      const cachedData = getCachedData(cacheKey);
      let shouldFetchFreshData = true;
      
      if (cachedData && cachedData.outlets) {
        const processedOutlets = processOutletData(cachedData.outlets);
        setOutlets(processedOutlets);
        setFilteredOutlets(processedOutlets);
        
        // Determine if we need to fetch fresh data based on last fetch time
        const now = Date.now();
        if (lastFetchTimestampRef.current && (now - lastFetchTimestampRef.current < CACHE_DURATION)) {
          shouldFetchFreshData = false;
          console.log('Using cached outlet data, last fetched:', new Date(lastFetchTimestampRef.current).toLocaleTimeString());
        }
      }
      
      // Fetch fresh data only if needed
      if (shouldFetchFreshData) {
        console.log('Fetching fresh outlet data');
        
        const freshData = await fetchData(`${COMMON_PREFIX}/get_outlet_list`, requestBody, {
          forceRefresh: true,
          transformResponse: (data) => data
        });
        
        if (freshData && freshData.outlets) {
          const processedOutlets = processOutletData(freshData.outlets);
          setOutlets(processedOutlets);
          setFilteredOutlets(processedOutlets);
          
          // Update the last fetch timestamp
          lastFetchTimestampRef.current = Date.now();
      } else {
        setError('No outlets found');
        }
      }
    } catch (err) {
      console.error('Error fetching outlets:', err);
      setError(err.response?.data?.detail || 'Failed to fetch outlets');
    }
  };

  // Handle outlet selection
  const handleOutletSelect = (outlet) => {
    // Only update localStorage if updateContextOnSelect is true (for main header)
    if (updateContextOnSelect) {
      // Store selected outlet details in localStorage
      localStorage.setItem('outlet_id', outlet.outlet_id);
      localStorage.setItem('outlet_name', outlet.name);
      localStorage.setItem('outlet_code', outlet.outlet_code || '');
      localStorage.setItem('outlet_address', outlet.address || '');
      localStorage.setItem('outlet_status', outlet.outlet_status ? 'active' : 'inactive');
      localStorage.setItem('outlet_is_open', outlet.is_open ? 'open' : 'closed');
      if (outlet.owner_name) {
        localStorage.setItem('owner_name', outlet.owner_name);
      }
      
      // Dispatch outlet:changed event to notify other components
      window.dispatchEvent(new CustomEvent('outlet:changed', { 
        detail: {
          outlet_id: outlet.outlet_id,
          name: outlet.name
        }
      }));
    }
    
    // Call onSelect callback
    if (onSelect) onSelect(outlet);
    
    // Close modal
    onClose();
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setAccountFilter('all');
    setOpenFilter('all');
    setSortOrder('default');
  };

  // Toggle sort order (default -> asc -> desc -> default)
  const toggleSortOrder = () => {
    if (sortOrder === 'default') {
      setSortOrder('asc');
    }
    else if (sortOrder === 'asc') {
      setSortOrder('desc');
    }
    else {
      setSortOrder('default');
    }
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Don't render anything if the modal isn't open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div 
        ref={modalRef} 
        className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-primary-50 border-b flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Outlet</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          {/* Search Bar */}
          <div className="relative mb-3 sm:mb-4">
            <input
              type="text"
              placeholder="Search by name, code, location or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-8 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Filter and Sort Options */}
          <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-1.5 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {/* Account Type Filter */}
            <div>
              <label htmlFor="account-filter" className="block text-xs font-medium text-gray-700 mb-1">Account Type</label>
              <select
                id="account-filter"
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-1.5 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="live">Live</option>
                <option value="test">Test</option>
              </select>
            </div>
            
            {/* Open Status Filter */}
            <div>
              <label htmlFor="open-filter" className="block text-xs font-medium text-gray-700 mb-1">Open Status</label>
              <select
                id="open-filter"
                value={openFilter}
                onChange={(e) => setOpenFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-1.5 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            {/* Sort Button Instead of Dropdown */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sort</label>
              <button
                onClick={toggleSortOrder}
                className="flex items-center justify-between w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {sortOrder === 'default' ? 'Default' : sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                </span>
                <span>
                  {sortOrder === 'default' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
                    </svg>
                  )}
                  {sortOrder === 'asc' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                  )}
                  {sortOrder === 'desc' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
          
          {/* Reset Filters Button - Only shown if any filter is active */}
          {isAnyFilterActive && (
            <div className="flex justify-end mt-2 sm:mt-3">
            <button
              onClick={resetFilters}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium focus:outline-none"
            >
              Reset Filters
            </button>
          </div>
          )}
        </div>
        
        {/* Outlet List */}
        <div className="overflow-y-auto flex-grow" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          {error ? (
            <div className="px-4 sm:px-6 py-4 text-center text-red-500">
              <svg className="mx-auto h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">{error}</p>
              <button
                onClick={fetchOutlets}
                className="mt-2 text-primary-600 hover:text-primary-800 font-medium"
              >
                Try Again
              </button>
            </div>
          ) : filteredOutlets.length === 0 ? (
            <div className="px-4 sm:px-6 py-4 text-center text-gray-500">
              <svg className="mx-auto h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No outlets found</p>
              {isAnyFilterActive && (
                <p className="mt-1 text-sm">
                  <button
                    onClick={resetFilters}
                    className="text-primary-600 hover:text-primary-800 font-medium focus:outline-none"
                  >
                    Reset filters
                  </button>
                </p>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredOutlets.map(outlet => {
                // Check if this is currently selected outlet
                const currentOutletId = localStorage.getItem('outlet_id');
                const isCurrentOutlet = currentOutletId && currentOutletId === outlet.outlet_id.toString();
                
                // Check if this outlet should be excluded
                const isExcluded = excludedOutletIds.includes(outlet.outlet_id.toString());
                
                return (
                  <li 
                    key={outlet.uniqueKey}
                    onClick={() => !isCurrentOutlet && !isExcluded && handleOutletSelect(outlet)}
                    className={`px-4 sm:px-6 py-3 sm:py-4 transition-colors ${
                      isCurrentOutlet ? 'bg-primary-50' : 
                      isExcluded ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 
                      'cursor-pointer hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex flex-wrap justify-between gap-2">
                      <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="font-medium text-gray-900 uppercase">{outlet.name}</h4>
                          {isCurrentOutlet && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                              Current
                            </span>
                          )}
                          {isExcluded && !isCurrentOutlet && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                        <div className="flex-shrink-0">
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            outlet.is_open 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {outlet.is_open ? 'Open' : 'Closed'}
                          </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            outlet.outlet_status 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {outlet.outlet_status ? 'Active' : 'Inactive'}
                          </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            outlet.account_type === 'live'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {outlet.account_type === 'live' ? 'Live' : 'Test'}
                          </span>
                        </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex flex-row flex-wrap items-center gap-2">
                        {/* Owner name */}
                        {outlet.owner_name && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <svg className="flex-shrink-0 h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{outlet.owner_name}</span>
                          </div>
                        )}
                        
                        {/* Outlet code */}
                        {outlet.outlet_code && (
                          <div className="text-sm text-gray-500 flex items-center ml-auto">
                            <svg className="flex-shrink-0 h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>{outlet.outlet_code}</span>
                          </div>
                        )}
                      </div>

                      {/* Address on separate line */}
                      {outlet.address && (
                        <div className="mt-1 text-sm text-gray-500 flex items-center">
                          <svg className="flex-shrink-0 h-4 w-4 mr-1 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="break-words">{toTitleCase(outlet.address)}</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutletSelector; 