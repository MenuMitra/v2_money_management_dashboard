import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { getAllStats } from '../api/statistics';

// Create context
const StatisticsContext = createContext();

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes

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
  // Track ongoing requests
  const pendingRequestRef = useRef(null);
  const currentOutletIdRef = useRef(null);

  // Function to fetch statistics data
  const fetchStatistics = useCallback(async (params = {}, forceRefresh = false) => {
    // Get outlet_id from params or localStorage
    const outlet_id = params.outlet_id || localStorage.getItem('outlet_id');
    if (!outlet_id) {
      return statistics; // Early return if no outlet_id
    }

    // Convert to number for consistent comparison
    const numericOutletId = parseInt(outlet_id, 10);

    // Check if we already have data for this outlet
    if (
      !forceRefresh &&
      statistics && 
      statistics.outlet_id === numericOutletId &&
      lastFetched &&
      Date.now() - lastFetched < CACHE_EXPIRATION
    ) {
      return statistics;
    }

    // If there's already a request in progress for this outlet, return that promise
    if (pendingRequestRef.current && currentOutletIdRef.current === numericOutletId && !forceRefresh) {
      return pendingRequestRef.current;
    }

    try {
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
        setStatistics(dataWithOutlet);
        setLastFetched(Date.now());
        return dataWithOutlet;
      }
      
      return statistics; // Return existing data if new data is null
    } catch (err) {
      console.error('Error fetching statistics:', err);
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