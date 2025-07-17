/**
 * Query key factory for statistics-related queries
 * @example
 * // Get all statistics
 * queryKeys.statistics.all({ outletId: 123 })
 * // Get specific statistic
 * queryKeys.statistics.detail({ outletId: 123, type: 'orders' })
 */
export const queryKeys = {
  statistics: {
    root: ['statistics'],
    all: (params) => [...queryKeys.statistics.root, 'all', params],
    detail: (params) => [...queryKeys.statistics.root, 'detail', params],
  },
  outlet: {
    root: ['outlet'],
    details: (params) => [...queryKeys.outlet.root, 'details', params],
    list: (params) => [...queryKeys.outlet.root, 'list', params], // Add this line
  }
}; 