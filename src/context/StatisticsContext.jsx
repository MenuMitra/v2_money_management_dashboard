import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getAllStats } from '../api/statistics';

// Create context
const StatisticsContext = createContext();

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes

// Helper function to generate a content hash based on data structure
const generateDataHash = (data) => {
  if (!data) return '';
  // Get a subset of important fields to determine if data has changed
  const keyFields = [
    data.analytic_reports?.total_orders,
    data.analytic_reports?.total_revenue,
    data.order_statistics?.success_orders,
    data.order_statistics?.cancelled_orders,
  ];
  return keyFields.join('|');
};

// Provider component
export const StatisticsProvider = ({ children }) => {
  // State for statistics data
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  // Track ongoing requests and data hash
  const pendingRequestRef = useRef(null);
  const currentOutletIdRef = useRef(null);
  const dataHashRef = useRef(null);
  const periodicCheckerRef = useRef(null);
  const forcedRefreshTimeRef = useRef(null);

  // Function to check if the data has changed
  const checkForDataChanges = useCallback(async (outletId) => {
    try {
      if (!outletId) return;
      
      console.log('Running background data freshness check');
      const numericOutletId = parseInt(outletId, 10);
      
      // Quick check API call - use a special endpoint or parameter if available
      // For now we'll use the same API but we could optimize this
      const apiParams = { outlet_id: numericOutletId, checkOnly: true };
      
      const data = await getAllStats(apiParams);
      if (!data) return;
      
      // Generate a hash of the new data
      const newHash = generateDataHash(data);
      const oldHash = dataHashRef.current;
      
      // If the hash is different, the data has changed
      if (newHash !== oldHash) {
        console.log('Data has changed, triggering refresh');
        // Update the hash and fetch the full data
        dataHashRef.current = newHash;
        // Set force refresh timestamp to avoid immediate re-fetch
        forcedRefreshTimeRef.current = Date.now();
        fetchStatistics({ outlet_id: numericOutletId }, true);
      }
    } catch (err) {
      console.error('Error checking for data changes:', err);
      // Don't set any errors in the UI for background checks
    }
  }, []);

  // Set up periodic background data freshness checks
  useEffect(() => {
    // Clear any existing checker
    if (periodicCheckerRef.current) {
      clearInterval(periodicCheckerRef.current);
    }
    
    if (currentOutletIdRef.current) {
      // Check for data changes every 5 minutes
      periodicCheckerRef.current = setInterval(() => {
        checkForDataChanges(currentOutletIdRef.current);
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    return () => {
      if (periodicCheckerRef.current) {
        clearInterval(periodicCheckerRef.current);
      }
    };
  }, [currentOutletIdRef.current, checkForDataChanges]);

  // Function to fetch statistics data
  const fetchStatistics = useCallback(async (params = {}, forceRefresh = false) => {
    // Get outlet_id from params or localStorage
    const outlet_id = params.outlet_id || localStorage.getItem('outlet_id');
    if (!outlet_id) {
      return statistics; // Early return if no outlet_id
    }

    // Convert to number for consistent comparison
    const numericOutletId = parseInt(outlet_id, 10);
    
    // Debug logging to track API call source
    const stack = new Error().stack;
    const caller = stack.split('\n')[2]?.trim() || 'unknown';
    console.log(`[StatisticsContext] fetchStatistics called from: ${caller}`);
    console.log(`[StatisticsContext] params:`, params, `forceRefresh:`, forceRefresh);

    // Check for recent forced refresh to avoid rapid successive refreshes
    if (
      !forceRefresh && 
      forcedRefreshTimeRef.current && 
      Date.now() - forcedRefreshTimeRef.current < 10000 // 10 seconds
    ) {
      console.log('[StatisticsContext] Skipping fetch - recent forced refresh');
      return statistics;
    }

    // Check if we already have data for this outlet and it's not expired
    if (
      !forceRefresh &&
      statistics && 
      statistics.outlet_id === numericOutletId &&
      lastFetched &&
      Date.now() - lastFetched < CACHE_EXPIRATION
    ) {
      console.log('[StatisticsContext] Using cached data - not expired yet');
      return statistics;
    }

    // If there's already a request in progress for this outlet, return that promise
    if (pendingRequestRef.current && currentOutletIdRef.current === numericOutletId && !forceRefresh) {
      console.log('[StatisticsContext] Request already in progress, reusing promise');
      return pendingRequestRef.current;
    }

    try {
      console.log('[StatisticsContext] Initiating API call for outlet ID:', numericOutletId);
      // Set loading in the background, but don't expose it to the UI
      setLoading(true);
      setError(null);
      
      // If this is a forced refresh for a new outlet, clear the existing data
      if (statistics && statistics.outlet_id !== numericOutletId) {
        setStatistics(null);
      }
      
      // Update current outlet being fetched
      currentOutletIdRef.current = numericOutletId;
      
      // Include outlet_id in the API request
      const apiParams = { ...params, outlet_id: numericOutletId };
      
      // Create the fetch promise and store it
      pendingRequestRef.current = getAllStats(apiParams);
      const data = await pendingRequestRef.current;
      
      // Clear the pending request reference
      pendingRequestRef.current = null;
      
      // Only update the state if we got valid data
      if (data) {
        // Add the outlet_id to the data for tracking
        const dataWithOutlet = {
          ...data,
          outlet_id: numericOutletId
        };
        
        // Update our data hash for change detection
        dataHashRef.current = generateDataHash(dataWithOutlet);
        
        setStatistics(dataWithOutlet);
        setLastFetched(Date.now());
        
        // If this was a forced refresh, update the timestamp
        if (forceRefresh) {
          forcedRefreshTimeRef.current = Date.now();
        }
        
        console.log('[StatisticsContext] Successfully updated statistics data');
        return dataWithOutlet;
      }
      
      return statistics; // Return existing data if new data is null
    } catch (err) {
      console.error('[StatisticsContext] Error fetching statistics:', err);
      setError(err.message || 'Failed to fetch statistics');
      pendingRequestRef.current = null;
      return statistics; // Return existing data on error
    } finally {
      setLoading(false);
    }
  }, [statistics, lastFetched]);

  // Update date range and fetch new data
  const updateDateRange = useCallback(async (startDate, endDate) => {
    setDateRange({ startDate, endDate });
    
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    return fetchStatistics(params, true);
  }, [fetchStatistics]);

  // Initial fetch on mount - only if outlet_id is available and no data exists
  useEffect(() => {
    const outlet_id = localStorage.getItem('outlet_id');
    if (outlet_id && !statistics) {
      fetchStatistics({ outlet_id: parseInt(outlet_id, 10) });
    }
  }, [fetchStatistics, statistics]);

  // Run a data freshness check when the component mounts
  useEffect(() => {
    const outlet_id = localStorage.getItem('outlet_id');
    if (outlet_id && currentOutletIdRef.current !== parseInt(outlet_id, 10)) {
      currentOutletIdRef.current = parseInt(outlet_id, 10);
      checkForDataChanges(outlet_id);
    }
  }, [checkForDataChanges]);

  // Listen for cache:clear event (e.g., on logout)
  useEffect(() => {
    const handleCacheClear = () => {
      console.log('Clearing statistics data due to logout');
      setStatistics(null);
      setLastFetched(null);
      dataHashRef.current = null;
      currentOutletIdRef.current = null;
      forcedRefreshTimeRef.current = null;
      
      // Clear any ongoing requests
      if (pendingRequestRef.current) {
        pendingRequestRef.current = null;
      }
      
      // Clear any interval
      if (periodicCheckerRef.current) {
        clearInterval(periodicCheckerRef.current);
        periodicCheckerRef.current = null;
      }
    };
    
    window.addEventListener('cache:clear', handleCacheClear);
    
    return () => {
      window.removeEventListener('cache:clear', handleCacheClear);
    };
  }, []);

  // Context value - we don't expose loading state to prevent UI flashing
  const value = {
    statistics,
    loading: false, // Always return false for loading to prevent UI flashing
    error,
    fetchStatistics,
    updateDateRange,
    dateRange
  };

  return (
    <StatisticsContext.Provider value={value}>
      {children}
    </StatisticsContext.Provider>
  );
};

// Custom hook for using the statistics context
export const useStatistics = () => {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
}; 