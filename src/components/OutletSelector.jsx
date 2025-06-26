import { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { COMMON_PREFIX } from '../api/axios';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [accountFilter, setAccountFilter] = useState('all'); // 'all', 'live', 'test'
  const [openFilter, setOpenFilter] = useState('all'); // 'all', 'open', 'closed'
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'asc', 'desc'

  // Fetch outlets when component mounts or modal opens
  useEffect(() => {
    if (isOpen) {
      fetchOutlets();
    }
  }, [isOpen]);

  // Apply filters and search when any filtering condition changes
  useEffect(() => {
    let filtered = [...outlets];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(outlet => {
        return (
          outlet.name.toLowerCase().includes(searchTermLower) ||
          (outlet.outlet_code && outlet.outlet_code.toLowerCase().includes(searchTermLower)) ||
          (outlet.address && outlet.address.toLowerCase().includes(searchTermLower))
        );
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(outlet => {
        return statusFilter === 'active' ? outlet.outlet_status : !outlet.outlet_status;
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
        return openFilter === 'open' ? outlet.is_open : !outlet.is_open;
      });
    }
    
    // Apply sorting
    if (sortOrder === 'asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    setFilteredOutlets(filtered);
  }, [searchTerm, outlets, statusFilter, accountFilter, openFilter, sortOrder]);

  // Fetch outlets from API
  const fetchOutlets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${COMMON_PREFIX}/get_outlet_list`, {
        owner_id: Number(userId),
        app_source: 'admin'
      });

      if (response.data && response.data.outlets) {
        const transformedOutlets = response.data.outlets.map(outlet => ({
          outlet_id: outlet.outlet_id,
          name: outlet.name || 'Unnamed Outlet',
          outlet_code: outlet.outlet_code || '',
          address: outlet.address || '',
          is_open: outlet.is_open || false,
          outlet_status: outlet.outlet_status || false,
          account_type: outlet.account_type || 'live'
        }));
        
        setOutlets(transformedOutlets);
        setFilteredOutlets(transformedOutlets);
      } else {
        setError('No outlets found');
      }
    } catch (err) {
      console.error('Error fetching outlets:', err);
      setError(err.response?.data?.detail || 'Failed to fetch outlets');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle outlet selection
  const handleOutletSelect = (outlet) => {
    // Only update localStorage if updateContextOnSelect is true (for main header)
    if (updateContextOnSelect) {
      // Store selected outlet details in localStorage
      localStorage.setItem('outlet_id', outlet.outlet_id);
      localStorage.setItem('outlet_name', outlet.name);
      localStorage.setItem('outlet_code', outlet.outlet_code);
      localStorage.setItem('outlet_address', outlet.address);
      localStorage.setItem('outlet_status', outlet.outlet_status ? 'active' : 'inactive');
      localStorage.setItem('outlet_is_open', outlet.is_open ? 'open' : 'closed');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef} 
        className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-primary-50 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Select Outlet</h3>
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
        <div className="px-6 py-4 border-b">
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search outlets by name, code or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            
            {/* Sort Order */}
            <div>
              <label htmlFor="sort-order" className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-1.5 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="default">Default</option>
                <option value="asc">Name (A-Z)</option>
                <option value="desc">Name (Z-A)</option>
              </select>
            </div>
          </div>
          
          {/* Reset Filters Button */}
          <div className="flex justify-end mt-3">
            <button
              onClick={resetFilters}
              className="text-xs text-primary-600 hover:text-primary-800 font-medium focus:outline-none"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Outlet List */}
        <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {isLoading ? (
            <div className="px-6 py-4 text-center text-gray-500">
              <svg className="animate-spin mx-auto h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2">Loading outlets...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-4 text-center text-red-500">
              <svg className="mx-auto h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">{error}</p>
            </div>
          ) : filteredOutlets.length === 0 ? (
            <div className="px-6 py-4 text-center text-gray-500">
              <svg className="mx-auto h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No outlets found</p>
              {(statusFilter !== 'all' || accountFilter !== 'all' || openFilter !== 'all' || sortOrder !== 'default' || searchTerm) && (
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
                    key={outlet.outlet_id}
                    onClick={() => !isCurrentOutlet && !isExcluded && handleOutletSelect(outlet)}
                    className={`px-6 py-4 transition-colors ${
                      isCurrentOutlet ? 'bg-primary-50' : 
                      isExcluded ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 
                      'cursor-pointer hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                          {isCurrentOutlet && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                              Current
                            </span>
                          )}
                          {isExcluded && !isCurrentOutlet && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                              Selected
                            </span>
                          )}
                        </div>
                        {outlet.address && (
                          <p className="mt-1 text-sm text-gray-500">
                            <svg className="inline-block h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {outlet.address}
                          </p>
                        )}
                      </div>
                      <div className="ml-2">
                        {outlet.outlet_code && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {outlet.outlet_code}
                          </span>
                        )}
                        <div className="mt-1 flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            outlet.is_open 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {outlet.is_open ? 'Open' : 'Closed'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            outlet.outlet_status 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {outlet.outlet_status ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            outlet.account_type === 'live'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {outlet.account_type === 'live' ? 'Live' : 'Test'}
                          </span>
                        </div>
                      </div>
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