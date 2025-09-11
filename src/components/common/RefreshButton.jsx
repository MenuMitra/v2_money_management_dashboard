import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { outletKeys } from '../../hooks/queries/useOutletDetails';
import { queryKeys } from '../../lib/react-query/constants';

/**
 * RefreshButton - A reusable button component for refreshing data
 */
export const RefreshButton = ({
  onRefresh,
  route,
  additionalClasses = '',
  size = 'md',
  borderRadius = 'md',
  showOnMobile = false,
  customIcon = null,
  isDataLoading = false,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Size variants mapping
  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  // Border radius mapping
  const borderRadiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  // Default refresh icon (static — no spin)
  const DefaultRefreshIcon = () => (
    <svg
      className="transition-transform"
      style={{
        height: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1rem',
        width: size === 'sm' ? '1rem' : size === 'lg' ? '1.5rem' : '1rem'
      }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="scale(-1,1) translate(-24,0)">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 
             004.582 9m0 0H9m11 11v-5h-.581m0 
             0a8.003 8.003 0 01-15.357-2m15.357 
             2H15"
        />
      </g>
    </svg>
  );

  // Route-based query invalidation
  const invalidateRouteQueries = useCallback(async () => {
    const outlet_id = localStorage.getItem('outlet_id');
    const user_id = localStorage.getItem('user_id');

    switch (route) {
      case '/outlet-details':
        return queryClient.invalidateQueries({
          queryKey: outletKeys.details({ outlet_id, user_id }),
          refetchType: 'active'
        });

      case '/statistics':
        return queryClient.invalidateQueries({
          queryKey: queryKeys.statistics.root,
          refetchType: 'active'
        });

      default:
        return onRefresh?.();
    }
  }, [route, queryClient, onRefresh]);

  // Refresh handler (button always works, never disabled)
  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await invalidateRouteQueries();
    } catch (error) {
      console.error(`Error refreshing data for route ${route}:`, error);
    } finally {
      setIsRefreshing(false);
    }
  }, [invalidateRouteQueries, route]);

  // Combine class names
  const buttonClasses = [
    'group',
    sizeClasses[size] || sizeClasses.md,
    borderRadiusClasses[borderRadius] || borderRadiusClasses.md,
    'flex items-center justify-center',
    'text-gray-600',
    'hover:text-primary-600 hover:bg-gray-50',
    'cursor-pointer',
    'focus:outline-none',
    'border border-gray-300',
    showOnMobile ? 'flex' : 'hidden md:flex',
    additionalClasses
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={handleRefresh}
      className={buttonClasses}
      title="Refresh"
      aria-label="Refresh data"
      aria-busy={isRefreshing || isDataLoading}
      data-route={route}
      type="button"
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
  borderRadius: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'xl', 'full']),
  showOnMobile: PropTypes.bool,
  customIcon: PropTypes.node,
  isDataLoading: PropTypes.bool,
  disabled: PropTypes.bool
};

export default RefreshButton;
