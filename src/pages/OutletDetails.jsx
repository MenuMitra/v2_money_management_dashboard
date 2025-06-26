import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutlet } from '../context/OutletContext';
import { useCacheData } from '../context/CacheDataContext';
import { API_PATHS } from '../api/index';
import { useOutletWarning } from '../hooks/useOutletId.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function OutletDetails() {
  const [outletData, setOutletData] = useState({
    name: "",
    address: "",
    outlet_status: false,
    mobile: "",
    outlet_type: "",
    veg_nonveg: "",
    created_on: "",
    opening_time: "",
    closing_time: "",
    outlet_code: "",
    owner_id: "",
    owners: [],
    menu_counts: { total: 0, active: 0, inactive: 0 },
    menu_category_counts: { total: 0, active: 0, inactive: 0 },
    section_counts: { total: 0, active: 0, inactive: 0 },
    table_counts: { total: 0, active: 0, inactive: 0 },
    waiter_counts: { total: 0, active: 0, inactive: 0 },
    captain_counts: { total: 0, active: 0, inactive: 0 },
    manager_counts: { total: 0, active: 0, inactive: 0 },
    chef_counts: { total: 0, active: 0, inactive: 0 },
    Inventory_Items_counts: { total: 0, active: 0, inactive: 0 },
    Inventory_Category_counts: { total: 0, active: 0, inactive: 0 },
    Inventory_Sub_Category_counts: { total: 0, active: 0, inactive: 0 },
    supplier_counts: { total: 0, active: 0, inactive: 0 },
    order_statistics: {
      total_days_since_menumitra_was_installed: 0,
      total_orders_since_menumitra_was_installed: 0,
      total_revenue: 0,
      first_order_date: ""
    }
  });
  const [error, setError] = useState(null);
  const { currentOutlet, loading: outletLoading } = useOutlet();
  const { fetchData, getCachedData } = useCacheData();
  const { hasOutlet, warningElement } = useOutletWarning();
  const [currentOutletId, setCurrentOutletId] = useState(localStorage.getItem('outlet_id'));
  const prevOutletIdRef = useRef(null);
  const isInitialMount = useRef(true);
  const outletChangeRef = useRef(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to check if a value is empty (0, null, undefined, empty string, "N/A")
  const isEmpty = (value) => {
    if (value === null || value === undefined || value === '' || value === 'N/A') return true;
    if (typeof value === 'number' && value === 0) return true;
    if (typeof value === 'string' && value.trim() === '0') return true;
    if (typeof value === 'string' && value.trim().toLowerCase() === 'n/a') return true;
    return false;
  };

  // Helper function to check if an object has any non-empty values
  const hasAnyValue = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    return Object.values(obj).some(value => {
      if (typeof value === 'object' && value !== null) {
        return hasAnyValue(value);
      }
      return !isEmpty(value);
    });
  };

  // Format currency in Indian format
  const formatIndianCurrency = (amount) => {
    if (!amount) return '₹0';
    
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0';
    
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return formatter.format(num);
  };

  // Format time from datetime string
  const formatTime = (datetimeStr) => {
    if (!datetimeStr) return 'N/A';
    
    try {
      // Extract time part (assuming format is "YYYY-MM-DD HH:MM:SS")
      const timePart = datetimeStr.split(' ')[1];
      if (!timePart) return 'N/A';
      
      // Convert to 12-hour format
      const [hours, minutes] = timePart.split(':');
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return datetimeStr;
    }
  };

  // Convert string to title case
  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to fetch outlet details - make it a useCallback to use in dependencies
  const fetchOutletDetails = useCallback(async (options = {}) => {
    // Get user and outlet IDs
    const userId = localStorage.getItem('user_id');
    const outletId = localStorage.getItem('outlet_id');
    
    if (!userId || !outletId) {
      setError('User ID or outlet ID not found');
      return;
    }
    
    // Parse IDs as integers for consistent comparison
    const numericOutletId = parseInt(outletId, 10);
    
    // Skip if we're already fetching for the same outlet ID and not forcing refresh
    if (!options.forceRefresh && !options.isInitialLoad && prevOutletIdRef.current === numericOutletId) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log(`Fetching outlet details for outlet ID: ${outletId}${options.isInitialLoad ? ' (initial load)' : ''}`);
      
      // Remember this outlet ID to prevent duplicate fetches (store as number for consistent comparison)
      prevOutletIdRef.current = numericOutletId;
      
      // If this is triggered by outlet change, set the flag to prevent re-triggering
      if (options.fromOutletChange) {
        outletChangeRef.current = true;
      }
      
      // Fetch data
      const data = await fetchData(API_PATHS.outletDetails, {
        user_id: Number(userId),
        outlet_id: numericOutletId
      }, {
        forceRefresh: options.forceRefresh || false,
        transformResponse: (response) => response?.detail || response
      });
      
      if (data) {
        // Use a functional update to avoid stale state issues
        setOutletData(prevData => ({...prevData, ...data}));
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching outlet details:', err);
      setError('Failed to load outlet details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  // One-time setup on component mount
  useEffect(() => {
    console.log('OutletDetails component mounted');
    
    // Get initial outlet ID
    const outletId = localStorage.getItem('outlet_id');
    if (outletId) {
      // Always fetch data on initial load, regardless of cache
      fetchOutletDetails({ isInitialLoad: true });
      
      // Mark that we're not on initial mount anymore
      isInitialMount.current = false;
    }
    
    // Set up event listeners
    const handleOutletChange = (newOutletId) => {
      if (!newOutletId) return;
      
      // Parse to number for consistent comparison
      const numericNewOutletId = parseInt(newOutletId, 10);
      const numericPrevOutletId = prevOutletIdRef.current;
      
      if (numericNewOutletId === numericPrevOutletId) return;
      
      console.log(`OutletDetails: Outlet changed to ${newOutletId} via event`);
      setCurrentOutletId(newOutletId);
      fetchOutletDetails({ forceRefresh: true });
    };
    
    // Handle custom events
    const onCustomEvent = (e) => {
      const newOutletId = e.detail?.outletId || localStorage.getItem('outlet_id');
      handleOutletChange(newOutletId);
    };
    
    // Handle storage events (for changes in other tabs)
    const onStorageChange = (e) => {
      if (e.key === 'outlet_id') {
        handleOutletChange(e.newValue);
      }
    };
    
    // Set up event listeners
    window.addEventListener('outlet:changed', onCustomEvent);
    window.addEventListener('storage', onStorageChange);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('outlet:changed', onCustomEvent);
      window.removeEventListener('storage', onStorageChange);
    };
  }, []); // Empty deps = run once on mount

  // Listen for outlet changes from context
  useEffect(() => {
    if (isInitialMount.current || !currentOutlet?.outlet_id) {
      return; // Skip on initial mount or if no outlet is selected
    }
    
    // Parse IDs as integers for consistent comparison
    const numericOutletId = parseInt(currentOutlet.outlet_id, 10);
    const numericPreviousOutletId = prevOutletIdRef.current;
    
    // Only fetch if the outlet ID has changed from what we last fetched
    if (numericPreviousOutletId !== numericOutletId) {
      console.log(`OutletDetails: Outlet changed in context from ${numericPreviousOutletId} to ${numericOutletId}`);
      setCurrentOutletId(currentOutlet.outlet_id);
      fetchOutletDetails({ forceRefresh: true, fromOutletChange: true });
    }
  }, [currentOutlet?.outlet_id, fetchOutletDetails]);

  // Food type indicator component - simplified
  const FoodTypeIndicator = ({ type }) => {
    if (!type) return null;
    
    const normalizedType = type.toLowerCase().trim();
    
    if (normalizedType === 'veg') {
      return <span className="inline-block w-3 h-3 rounded-full bg-green-500 ml-2"></span>;
    }
    
    if (normalizedType === 'non-veg' || normalizedType === 'nonveg') {
      return <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-2"></span>;
    }
    
    return null;
  };

  // Stats block component
  const StatItem = ({ label, value }) => {
    if (isEmpty(value)) return null;
    
    return (
      <div className="bg-white border border-gray-100 rounded-md p-4">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-medium">{value}</p>
      </div>
    );
  };
  
  // Stats section for counts
  const CountsSection = ({ title, data, isLoading = false }) => {
    // Don't render sections with no meaningful data
    if (!isLoading) {
      const hasAnyData = Object.values(data).some(countData => 
        (countData?.total && countData.total > 0) || 
        (countData?.active && countData.active > 0) || 
        (countData?.inactive && countData.inactive > 0)
      );
      
      if (!hasAnyData) return null;
    }
    
    // Filter out empty sections
    const sections = Object.entries(data).filter(([_, countData]) => 
      isLoading || (countData?.total > 0 || countData?.active > 0 || countData?.inactive > 0)
    );
    
    if (sections.length === 0) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sections.map(([key, countData]) => {
            const displayKey = key
              .replace(/([A-Z])/g, ' $1')  // Insert a space before all uppercase letters
              .replace(/_counts$/, '')     // Remove _counts suffix
              .replace(/_/g, ' ')          // Replace underscores with spaces
              .trim();                     // Trim any leading/trailing whitespace

            if (!isLoading && !countData.total && !countData.active && !countData.inactive) return null;

  return (
              <div key={key} className="bg-gray-50 p-4 rounded-md border border-gray-100 transition-all hover:shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-600 capitalize">{displayKey}</p>
                  <span className="text-xl font-semibold text-gray-800">{isLoading ? "0" : (countData.total || 0)}</span>
        </div>
                
                {/* Only show active count if it exists and is not zero */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {(!isLoading && !countData.active && !countData.inactive) ? (
                    <div className="text-center text-xs text-gray-500">No details available</div>
      ) : (
        <>
                      {(isLoading || countData.active > 0) && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Active</span>
                          <span className="text-sm font-medium text-green-600">{isLoading ? "0" : countData.active}</span>
                    </div>
                      )}
                      {(isLoading || countData.inactive > 0) && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">Inactive</span>
                          <span className="text-sm font-medium text-red-500">{isLoading ? "0" : countData.inactive}</span>
                  </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Usage stats section
  const UsageStatsSection = ({ data, isLoading = false }) => {
    // Don't render if no meaningful data is available
    if (!isLoading) {
      const hasData = data && (
        data.total_days_since_menumitra_was_installed > 0 ||
        data.total_orders_since_menumitra_was_installed > 0 ||
        data.total_revenue > 0 ||
        (data.first_order_date && data.first_order_date !== 'N/A')
      );
      
      if (!hasData) return null;
    }
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">MenuMitra Usage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Days Since Installation - only show if value > 0 */}
          {(isLoading || (data?.total_days_since_menumitra_was_installed > 0)) && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex flex-col">
                <span className="text-sm text-blue-700 mb-1">Days Since Installation</span>
                <span className="text-2xl font-semibold text-blue-900">
                  {isLoading ? "0" : (data?.total_days_since_menumitra_was_installed || 0)}
                </span>
              </div>
            </div>
          )}
          
          {/* Total Orders - only show if value > 0 */}
          {(isLoading || (data?.total_orders_since_menumitra_was_installed > 0)) && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex flex-col">
                <span className="text-sm text-green-700 mb-1">Total Orders</span>
                <span className="text-2xl font-semibold text-green-900">
                  {isLoading ? "0" : parseInt(data?.total_orders_since_menumitra_was_installed || 0).toLocaleString()}
                      </span>
              </div>
            </div>
          )}
          
          {/* Total Revenue - only show if value > 0 */}
          {(isLoading || (data?.total_revenue > 0)) && (
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex flex-col">
                <span className="text-sm text-purple-700 mb-1">Total Revenue</span>
                <span className="text-2xl font-semibold text-purple-900">
                  {isLoading ? "₹0" : formatIndianCurrency(data?.total_revenue || 0)}
                </span>
              </div>
            </div>
          )}
          
          {/* First Order Date - only show if exists and not N/A */}
          {(isLoading || (data?.first_order_date && data?.first_order_date !== 'N/A')) && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <div className="flex flex-col">
                <span className="text-sm text-amber-700 mb-1">First Order Date</span>
                <span className="text-2xl font-semibold text-amber-900">
                  {isLoading ? "N/A" : (data?.first_order_date || 'N/A')}
                </span>
              </div>
            </div>
          )}
            </div>
          </div>
    );
  };

  // Owners section - displayed like other fields
  const OwnersSection = ({ owners = [], isLoading = false }) => {
    // Don't render if no owners and not loading
    if (!isLoading && (!owners || owners.length === 0)) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">Outlet Owners</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
              <p className="text-gray-500">Loading owner information...</p>
            </div>
          ) : owners.map((owner) => (
            <div key={owner.owner_id} className="bg-gray-50 p-4 rounded-md border border-gray-100 hover:shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{owner.owner_name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {owner.is_primary ? 'Primary Owner' : 'Owner'}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${owner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {owner.is_active ? 'Active' : 'Inactive'}
                </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
    );
  };
  
  // Breadcrumb component
  const Breadcrumb = () => {
    return (
      <nav className="flex mb-5" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
              </svg>
              Back
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <Link to="/" className="ml-1 text-sm font-medium text-gray-600 hover:text-blue-600 md:ml-2">Home</Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Outlet Details</span>
            </div>
          </li>
        </ol>
      </nav>
    );
  };

  // If no outlet is selected, show warning
  if (!hasOutlet) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Outlet Details</h1>
        {warningElement}
        <p className="text-gray-600 mt-4">Please select an outlet to view outlet details.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb />
        
        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-white border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Main Content */}
        <div className="space-y-6">
          {/* Outlet Basic Info */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-100">Outlet Details</h1>
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <h2 className="text-xl font-semibold text-gray-900 mr-2">
                    {isLoading ? "Outlet Name" : (outletData.name || "Outlet Name")}
                  </h2>
                  
                  {!isLoading && !isEmpty(outletData.outlet_status) && (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${outletData.outlet_status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {outletData.outlet_status ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>
                {!isLoading && (outletData.outlet_type || outletData.veg_nonveg) && (
                  <p className="text-gray-600 flex items-center">
                    {outletData.outlet_type && <span className="capitalize">{outletData.outlet_type}</span>}
                    {outletData.veg_nonveg && (
                      <span className="ml-3 flex items-center">
                        <span className="capitalize">{outletData.veg_nonveg}</span>
                        <FoodTypeIndicator type={outletData.veg_nonveg} />
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Only show outlet code if it exists or loading */}
              {(isLoading || !isEmpty(outletData.outlet_code)) && (
              <div>
                  <div className="px-4 py-2 bg-gray-50 rounded-md border border-gray-100 inline-block">
                    <div className="text-xs text-gray-500 mb-1">Outlet Code</div>
                    <div className="text-lg font-medium text-gray-800">
                      {isLoading ? "N/A" : outletData.outlet_code}
                    </div>
                  </div>
                </div>
              )}
                  </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              {/* Show contact info only if exists or loading */}
              {(isLoading || !isEmpty(outletData.mobile)) && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-xs uppercase text-gray-500 tracking-wider mb-1">Contact</div>
                  <div className="text-base font-medium">
                    {isLoading ? "N/A" : outletData.mobile}
                  </div>
                </div>
              )}
              
              {/* Show created on only if exists or loading */}
              {(isLoading || !isEmpty(outletData.created_on)) && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-xs uppercase text-gray-500 tracking-wider mb-1">Created On</div>
                  <div className="text-base font-medium">
                    {isLoading ? "N/A" : outletData.created_on}
                  </div>
                </div>
              )}
              
              {/* Show operating hours only if exists or loading */}
              {(isLoading || !isEmpty(outletData.opening_time) || !isEmpty(outletData.closing_time)) && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-xs uppercase text-gray-500 tracking-wider mb-1">Operating Hours</div>
                  <div className="text-base font-medium">
                    {isLoading ? "N/A - N/A" : (
                      `${!isEmpty(outletData.opening_time) ? formatTime(outletData.opening_time) : 'N/A'} - 
                      ${!isEmpty(outletData.closing_time) ? formatTime(outletData.closing_time) : 'N/A'}`
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Show address section only if exists or loading */}
            {(isLoading || !isEmpty(outletData.address)) && (
              <div className="pt-4 border-t border-gray-100">
                <div className="text-xs uppercase text-gray-500 tracking-wider mb-1">Address</div>
                <p className="text-base font-medium">
                  {isLoading ? "N/A" : toTitleCase(outletData.address)}
                </p>
              </div>
            )}
          </div>

          {/* Owners Section - always show */}
          <OwnersSection owners={outletData.owners} isLoading={isLoading} />
          
          {/* Usage Stats - show only if has data */}
          <UsageStatsSection data={outletData.order_statistics} isLoading={isLoading} />
          
          {/* Menu Information - show only if has data */}
          <CountsSection 
            title="Menu Information" 
            data={{
              menu: outletData.menu_counts || {},
              menu_category: outletData.menu_category_counts || {},
              section: outletData.section_counts || {},
              table: outletData.table_counts || {}
            }}
            isLoading={isLoading}
          />
          
          {/* Staff Information - show only if has data */}
          <CountsSection 
            title="Staff Information" 
            data={{
              waiter: outletData.waiter_counts || {},
              captain: outletData.captain_counts || {},
              manager: outletData.manager_counts || {},
              chef: outletData.chef_counts || {}
            }}
            isLoading={isLoading}
          />
          
          {/* Inventory Information - show only if has data */}
          <CountsSection 
            title="Inventory Information" 
            data={{
              Inventory_Items: outletData.Inventory_Items_counts || {},
              Inventory_Category: outletData.Inventory_Category_counts || {},
              Inventory_Sub_Category: outletData.Inventory_Sub_Category_counts || {},
              supplier: outletData.supplier_counts || {}
            }}
            isLoading={isLoading}
          />
            </div>
          </div>
    </div>
  );
} 