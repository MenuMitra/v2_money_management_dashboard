import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { outletKeys } from '../../hooks/queries/useOutletDetails';
import { queryKeys } from '../../lib/react-query/constants';

/**
 * @typedef {Object} RefreshButtonProps
 * @property {Function} onRefresh - Function that returns a Promise for API call
 * @property {string} route - String to identify which part of the app is calling the refresh
 * @property {string} [additionalClasses] - Optional string for additional CSS classes
 * @property {('sm'|'md'|'lg')} [size='md'] - Optional string for button size variants
 * @property {('none'|'sm'|'md'|'lg'|'xl'|'full')} [borderRadius='md'] - Optional string for border radius variants
 * @property {boolean} [showOnMobile=false] - Optional boolean to control mobile visibility
 * @property {React.ReactNode} [customIcon] - Optional component to override default refresh icon
 * @property {boolean} [isDataLoading=false] - Optional boolean to control spinner state based on data loading
 */

/**
 * RefreshButton - A reusable button component for refreshing data
 * @param {RefreshButtonProps} props - Component props
 * @returns {React.ReactElement}
 */
export const RefreshButton = ({
  onRefresh,
  route,
  additionalClasses = '',
  size = 'md',
  borderRadius = 'md', // New prop with default value
  showOnMobile = false,
  customIcon = null,
  isDataLoading = false // New prop to control spinner based on external loading state
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const queryClient = useQueryClient();
  
  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      setIsRefreshing(false);
    };
  }, []);

  // Size variants mapping
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  // Add border radius variants mapping
  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Default refresh icon
  const DefaultRefreshIcon = () => (
    <svg
      className={`transition-transform ${isRefreshing || isDataLoading ? "animate-spin" : ""}`}
      style={{ 
        height: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1rem',
        width: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1rem'
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <g transform="scale(-1,1) translate(-24,0)">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </g>
    </svg>
  );

  // Route-based query invalidation
  const invalidateRouteQueries = useCallback(async () => {
    const outlet_id = localStorage.getItem('outlet_id');
    const user_id = localStorage.getItem('user_id');

    // Map routes to their corresponding query keys
    switch (route) {
      case '/outlet-details':
        return queryClient.invalidateQueries({
          queryKey: outletKeys.details({ outlet_id, user_id }),
          refetchType: 'active', // Only refetch if the query is active
        });
      
      case '/statistics':
        return queryClient.invalidateQueries({
          queryKey: queryKeys.statistics.root,
          refetchType: 'active',
        });
      
      // Add more route cases as needed
      
      default:
        // If no specific route match, use the provided onRefresh function
        return onRefresh?.();
    }
  }, [route, queryClient, onRefresh]);

  // Debounced refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      // Debounce check - prevent refreshes within 1 second
      const now = Date.now();
      if (now - lastRefreshTime < 1000) {
        console.warn('Refresh action debounced. Please wait before trying again.');
        return;
      }

      // Set loading state and update last refresh time
      setIsRefreshing(true);
      setLastRefreshTime(now);

      // Log refresh attempt
      console.debug(`Refreshing data for route: ${route}`);

      // Invalidate and refetch queries based on route
      await invalidateRouteQueries();

    } catch (error) {
      console.error(`Error refreshing data for route ${route}:`, error);
    } finally {
      // Only stop the internal refresh spinner if data loading is not in progress
      if (!isDataLoading) {
        // Ensure minimum loading state duration of 500ms for UX
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      } else {
        // If data is still loading, keep the internal state as refreshing
        // The spinner will stop when isDataLoading becomes false
        setIsRefreshing(false);
      }
    }
  }, [invalidateRouteQueries, route, lastRefreshTime, isDataLoading]);

  // Combine class names
  const buttonClasses = [
    'group',
    sizeClasses[size] || sizeClasses.md,
    borderRadiusClasses[borderRadius] || borderRadiusClasses.md, // Use the border radius class
    'flex items-center justify-center',
    'text-gray-600 hover:text-primary-600',
    'hover:bg-gray-50',
    'focus:outline-none',
    'border border-gray-300',
    showOnMobile ? 'flex' : 'hidden md:flex',
    additionalClasses
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={handleRefresh}
      className={buttonClasses}
      title="Refresh"
      disabled={isRefreshing || isDataLoading}
      aria-label="Refresh data"
      aria-busy={isRefreshing || isDataLoading}
      data-route={route}
    >
      {customIcon || <DefaultRefreshIcon />}
    </button>
  );
};

// Update PropTypes validation
RefreshButton.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  additionalClasses: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  borderRadius: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', 'full']),
  showOnMobile: PropTypes.bool,
  customIcon: PropTypes.node,
  isDataLoading: PropTypes.bool
};

export default RefreshButton;
