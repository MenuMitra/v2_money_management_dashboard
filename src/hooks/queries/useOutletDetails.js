// src/hooks/queries/useOutletDetails.js
import { useQuery } from "@tanstack/react-query";
import { api, API_PATHS } from "../../api";

// Add to queryKeys in constants.js
export const outletKeys = {
  root: ["outlet"],
  details: (params) => [...outletKeys.root, "details", params],
};

export function useOutletDetails(params, options = {}) {
  const { user_id, outlet_id } = params;

  return useQuery({
    // Use the query key factory
    queryKey: outletKeys.details({ outlet_id, user_id }),

    // Query function that matches the existing API call
    queryFn: async () => {
      const response = await api.post(API_PATHS.outletDetails, {
        user_id,
        outlet_id,
        app_source: "admin", // This is handled by axios interceptor but being explicit
      });
      return response.data?.detail || response.data;
    },

    // Only run query if we have both IDs
    enabled: Boolean(outlet_id && user_id),

    // Spread additional options from the hook params
    ...options,
  });
}
