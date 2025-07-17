import { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * @typedef {Object} RefreshButtonProps
 * @property {Function} onRefresh - Function that returns a Promise for API call
 * @property {string} route - String to identify which part of the app is calling the refresh
 * @property {string} [additionalClasses] - Optional string for additional CSS classes
 * @property {('sm'|'md'|'lg')} [size='md'] - Optional string for button size variants
 * @property {boolean} [showOnMobile=false] - Optional boolean to control mobile visibility
 * @property {React.ReactNode} [customIcon] - Optional component to override default refresh icon
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
  showOnMobile = false,
  customIcon = null
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  
  // Cleanup function for component unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setIsRefreshing(false);
    };
  }, []);

  // Size variants mapping
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  // Default refresh icon
  const DefaultRefreshIcon = () => (
    <svg
      className={`transition-transform ${
        isRefreshing ? "animate-spin" : ""
      }`}
      style={{ 
        height: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1rem',
        width: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1rem'
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );

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

      // Call the provided refresh function
      await onRefresh();

    } catch (error) {
      console.error(`Error refreshing data for route ${route}:`, error);
    } finally {
      // Ensure minimum loading state duration of 500ms for UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [onRefresh, route, lastRefreshTime]);

  // Combine class names
  const buttonClasses = [
    'group',
    sizeClasses[size] || sizeClasses.md,
    'flex items-center justify-center',
    'rounded-md',
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
      disabled={isRefreshing}
      aria-label="Refresh data"
      aria-busy={isRefreshing}
      data-route={route}
    >
      {customIcon || <DefaultRefreshIcon />}
    </button>
  );
};

// PropTypes validation
RefreshButton.propTypes = {
  onRefresh: PropTypes.func.isRequired,
  route: PropTypes.string.isRequired,
  additionalClasses: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showOnMobile: PropTypes.bool,
  customIcon: PropTypes.node
};

// Default export
export default RefreshButton;
