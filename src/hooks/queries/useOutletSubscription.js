import { useOutletDetails } from './useOutletDetails';

/**
 * Hook for fetching outlet subscription data
 * This is a wrapper around useOutletDetails that extracts subscription-specific data
 * @param {Object} params - Query parameters
 * @param {number} params.outlet_id - Outlet ID
 * @param {number} params.user_id - User ID
 * @param {Object} [options] - Additional query options
 * @returns {UseQueryResult} Query result object with subscription data
 */
export function useOutletSubscription(params, options = {}) {
  // Use the existing outlet details hook
  const outletDetailsQuery = useOutletDetails(params, options);
  
  // Extract subscription data from outlet details
  const subscriptionData = outletDetailsQuery.data?.subscription || null;
  
  return {
    ...outletDetailsQuery,
    data: {
      ...outletDetailsQuery.data,
      subscription: subscriptionData
    }
  };
}
