import { useState, useCallback, useEffect, useRef } from 'react';
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
 * @property {boolean} [isDataLoading=false] - Optional boolean to control spinner state based on external loading state
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const tooltipTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const queryClient = useQueryClient();
  
  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      setIsRefreshing(false);
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  // Effect to handle cooldown timer display
  useEffect(() => {
    if (isDataLoading && !isRefreshing) {
      // If external loading is active but not from this button's action,
      // we'll show the spinner but not start a cooldown timer
      return;
    }

    if (isRefreshing) {
      // When refreshing starts, initialize cooldown seconds
      setCooldownSeconds(10);
    } else if (cooldownSeconds > 0) {
      // Start countdown timer
      cooldownTimerRef.current = setInterval(() => {
        setCooldownSeconds(prev => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [isRefreshing, cooldownSeconds, isDataLoading]);

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
      // If external data loading is in progress, don't allow refresh
      if (isDataLoading) {
        console.warn('Refresh action blocked: Data is still loading or in cooldown period');
        return;
      }

      // Debounce check - prevent refreshes within 10 seconds
      const now = Date.now();
      if (now - lastRefreshTime < 10000) {
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

  // Handle tooltip display
  const handleMouseEnter = () => {
    if (isDataLoading || cooldownSeconds > 0) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

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
    <div className="relative inline-block">
      <button
        onClick={handleRefresh}
        className={buttonClasses}
        title={isDataLoading || cooldownSeconds > 0 ? "Please wait" : "Refresh"}
        disabled={isRefreshing || isDataLoading || cooldownSeconds > 0}
        aria-label="Refresh data"
        aria-busy={isRefreshing || isDataLoading}
        data-route={route}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {customIcon || <DefaultRefreshIcon />}
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm z-10 whitespace-nowrap">
          {cooldownSeconds > 0 
            ? `Please wait ${cooldownSeconds}s before refreshing again` 
            : 'Data is loading...'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
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
