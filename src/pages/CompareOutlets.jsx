import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, API_PATHS } from "../api/index";
import { useOutlet } from "../context/OutletContext";
import { useOutletWarning } from "../hooks/useOutletId.jsx";
import OutletSelector from "../components/OutletSelector";
import { Breadcrumb } from "../components";
import {
  useOutletComparison,
  outletCompareKeys,
} from "../hooks/queries/useOutletComparison";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { RefreshButton } from "../components/common/RefreshButton";
import { FaExchangeAlt } from "react-icons/fa";

export default function CompareOutlets() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentOutlet } = useOutlet();
  const { hasOutlet, warningElement } = useOutletWarning();
  const queryClient = useQueryClient();

  const MAX_COMPARE_OUTLETS = 3; // Maximum outlets to compare

  // Currently selected outlets for comparison (object format with full data)
  const [selectedOutlets, setSelectedOutlets] = useState([]);

  // Outlet selector modal state
  const [isOutletSelectorOpen, setIsOutletSelectorOpen] = useState(false);
  const [refreshOutletIndex, setRefreshOutletIndex] = useState(null);

  // All metrics to display in specific order
  const [metrics] = useState([
    {
      id: "installation_statistics.total_orders",
      name: "Total Orders",
      type: "number",
    },
    {
      id: "installation_statistics.days_since_installation",
      name: "Days Since Installation",
      type: "number",
    },
    {
      id: "installation_statistics.first_order_date",
      name: "First Order Date",
      type: "date",
    },
    {
      id: "revenue_statistics.total_revenue",
      name: "Total Revenue",
      type: "currency",
    },
    { id: "payment_statistics.upi", name: "UPI Payments", type: "currency" },
    { id: "payment_statistics.card", name: "Card Payments", type: "currency" },
    { id: "payment_statistics.cash", name: "Cash Payments", type: "currency" },
    {
      id: "payment_statistics.complementary",
      name: "Complementary",
      type: "currency",
    },
    { id: "payment_statistics.udhari", name: "Udhari", type: "currency" },
    {
      id: "order_status_statistics.success",
      name: "Successful Orders",
      type: "number",
    },
    {
      id: "order_status_statistics.cancelled",
      name: "Cancelled Orders",
      type: "number",
    },
    {
      id: "order_status_statistics.kot_orders",
      name: "KOT Orders",
      type: "number",
    },
    {
      id: "order_status_statistics.complementary_orders",
      name: "Complementary Orders",
      type: "number",
    },
    {
      id: "order_status_statistics.udhari_orders",
      name: "Udhari Orders",
      type: "number",
    },
    {
      id: "order_type_statistics.dine_in",
      name: "Dine In Orders",
      type: "number",
    },
    {
      id: "order_type_statistics.parcel",
      name: "Parcel Orders",
      type: "number",
    },
    {
      id: "order_type_statistics.drive_through",
      name: "Drive Through Orders",
      type: "number",
    },
    {
      id: "order_type_statistics.counter",
      name: "Counter Orders",
      type: "number",
    },
    {
      id: "order_type_statistics.delivery", // New metric for Delivery Orders
      name: "Delivery Orders",
      type: "number",
    },
    {
      id: "udhari_statistics.udhari_pending",
      name: "Udhari Pending",
      type: "currency",
    },
    {
      id: "udhari_statistics.udhari_settled",
      name: "Udhari Settled",
      type: "currency",
    },
    {
      id: "advance_payment_statistics.booking_settled",
      name: "Booking Settled",
      type: "currency",
    },
    {
      id: "advance_payment_statistics.partial_payment",
      name: "Partial Payment",
      type: "currency",
    },
  ]);

  // Clear error message after 6 seconds (changed from 7 seconds)
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 6000); // 6 seconds

      // Cleanup the timer when the component unmounts or error changes
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Format currency in Indian format
  const formatIndianCurrency = (amount) => {
    if (amount === undefined || amount === null) return "₹0";

    const num = parseFloat(amount);
    if (isNaN(num)) return "₹0";

    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(num);
  };

  // Helper function to generate a content hash based on data structure
  const generateDataHash = useCallback((data) => {
    if (!data) return "";
    // Get a subset of important fields to determine if data has changed
    const keyFields = [
      data.installation_statistics?.total_orders,
      data.revenue_statistics?.total_revenue,
      data.order_status_statistics?.success,
      data.order_status_statistics?.cancelled,
    ];
    return keyFields.join("|");
  }, []);

  // Modified function to check if data has actually changed
  const isDataChanged = useCallback(
    (oldData, newData) => {
      const oldHash = generateDataHash(oldData);
      const newHash = generateDataHash(newData);
      return oldHash !== newHash;
    },
    [generateDataHash]
  );

  // Use query with renamed variables
  const {
    data: currentOutletComparisonData = {},
    isLoading: isLoadingComparison,
  } = useOutletComparison(
    {
      user_id: localStorage.getItem("user_id"),
      outlet_id: currentOutlet?.outlet_id,
    },
    {
      enabled: Boolean(currentOutlet?.outlet_id),
      select: (data) => ({
        id: currentOutlet?.outlet_id,
        outlet_id: currentOutlet?.outlet_id,
        name: currentOutlet?.name || "Current Outlet",
        address: currentOutlet?.address || "",
        ...data,
      }),
    }
  );

  // Replace fetchCurrentOutletDetails with query invalidation
  const refreshCurrentOutlet = useCallback(() => {
    if (currentOutlet?.outlet_id) {
      queryClient.invalidateQueries({
        queryKey: outletCompareKeys.detail({
          user_id: Number(localStorage.getItem("user_id")),
          outlet_id: Number(currentOutlet.outlet_id),
        }),
      });
    }
  }, [currentOutlet, queryClient]);

  // Add this hook at the top level of the component
  const useOutletCompareDetails = (outletId) => {
    const userId = localStorage.getItem("user_id");

    return useQuery({
      queryKey: outletCompareKeys.detail({
        user_id: Number(userId),
        outlet_id: Number(outletId),
      }),
      queryFn: async () => {
        const response = await api.post(API_PATHS.outletCompareDetails, {
          user_id: Number(userId),
          outlet_id: Number(outletId),
        });
        return response.data?.detail || null;
      },
      // Using global config from provider.jsx:
      // staleTime: 60 seconds
      // gcTime: 5 minutes
      enabled: Boolean(outletId && userId),
    });
  };

  // Replace the fetchOutletCompareDetails function with this simpler version
  const fetchOutletCompareDetails = async (outletId) => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("user_id");

      if (!userId || !outletId) {
        console.error("Missing user ID or outlet ID");
        return null;
      }

      // Use the prefetchQuery to ensure we have the data
      const data = await queryClient.fetchQuery({
        queryKey: outletCompareKeys.detail({
          user_id: Number(userId),
          outlet_id: Number(outletId),
        }),
        queryFn: async () => {
          const response = await api.post(API_PATHS.outletCompareDetails, {
            user_id: Number(userId),
            outlet_id: Number(outletId),
          });
          return response.data?.detail || null;
        },
      });

      return data;
    } catch (err) {
      console.error(
        `Error fetching comparison details for outlet ${outletId}:`,
        err
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenOutletSelector = () => {
    // Open the outlet selector
    setIsOutletSelectorOpen(true);
    setRefreshOutletIndex(null);
  };

  // Update the handleOutletSelect function to check for inactive outlet
  const handleOutletSelect = async (outlet) => {
    try {
      const outlet = outlets.find((o) => o.outlet_id === outletId);
       console.log("Selected outlet data:", outlet);
      // Check if the outlet is inactive first
      if (outlet.is_active === false) {
        setError("Cannot select an inactive outlet for comparison");
        return;
      }

      if (
        selectedOutlets.length >= MAX_COMPARE_OUTLETS &&
        refreshOutletIndex === null
      ) {
        setError(`You can only compare up to ${MAX_COMPARE_OUTLETS} outlets`);
        return;
      }

      // Check if outlet is the current outlet or already selected
      if (
        outlet.outlet_id.toString() === currentOutlet?.outlet_id?.toString()
      ) {
        setError("You cannot select the current outlet for comparison");
        return;
      }

      if (
        selectedOutlets.some(
          (o) => o.outlet_id.toString() === outlet.outlet_id.toString()
        )
      ) {
        setError("This outlet is already selected for comparison");
        return;
      }

      setIsLoading(true);

      // Fetch comparison data for this outlet
      const outletId = outlet.outlet_id;
      const comparisonData = await fetchOutletCompareDetails(outletId);

      if (comparisonData) {
        // Prepare the outlet object with all data
        const outletWithData = {
          id: outletId,
          outlet_id: outletId,
          name: outlet.name,
          address: outlet.address || "",
          ...comparisonData,
        };

        // If we're refreshing an existing outlet
        if (refreshOutletIndex !== null) {
          const updatedOutlets = [...selectedOutlets];
          updatedOutlets[refreshOutletIndex] = outletWithData;
          setSelectedOutlets(updatedOutlets);
        } else {
          // Add to selected outlets with comparison data
          setSelectedOutlets((prev) => [...prev, outletWithData]);
        }

        setIsOutletSelectorOpen(false);
        setRefreshOutletIndex(null);
      } else {
        throw new Error(
          `Could not fetch comparison data for outlet ${outletId}`
        );
      }
    } catch (err) {
      console.error("Error adding outlet:", err);
      setError(`Failed to add outlet for comparison: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshOutlet = (index) => {
    const outletToRefresh = selectedOutlets[index];
    if (outletToRefresh) {
      // Invalidate the cache for this outlet
      invalidateOutletCache(outletToRefresh.outlet_id);
    }
    setRefreshOutletIndex(index);
    setIsOutletSelectorOpen(true);
  };

  const handleRemoveOutlet = (index) => {
    setSelectedOutlets((prev) => prev.filter((_, i) => i !== index));
  };

  // Extract a nested value from an object using a path string (e.g., "revenue_statistics.total_revenue")
  const getNestedValue = (obj, path) => {
    if (!obj) return null;
    return path
      .split(".")
      .reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj);
  };

  // Format value based on its type
  const formatValue = (value, type) => {
    if (value === null || value === undefined) {
      return type === "date" ? "-" : "₹0";
    }

    if (type === "currency") {
      return formatIndianCurrency(value);
    }

    if (type === "date") {
      try {
        if (!value) return "-";
        const date = new Date(value);
        if (isNaN(date.getTime())) return "-";

        const day = date.getDate().toString().padStart(2, "0");
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year}`;
      } catch (error) {
        console.error("Error formatting date:", error);
        return "-";
      }
    }

    if (type === "number") {
      return value.toLocaleString();
    }

    return value;
  };

  // Initialize component - fetch current outlet details when mounted
  useEffect(() => {
    if (currentOutlet?.outlet_id) {
      // Check if we have this outlet ID cached already
      const cacheKey = currentOutlet.outlet_id.toString();
      const isCached = queryClient.getQueryData(
        outletCompareKeys.detail({
          user_id: Number(localStorage.getItem("user_id")),
          outlet_id: Number(currentOutlet.outlet_id),
        })
      );
      const now = Date.now();

      // Only fetch if:
      // 1. The data is not cached yet, OR
      // 2. The cache has expired
      if (!isCached) {
        console.log(
          `[CompareOutlets] First mount or cache expired, fetching outlet ${currentOutlet.outlet_id}`
        );
        refreshCurrentOutlet();
      } else {
        console.log(
          `[CompareOutlets] Component remounted, using cached data for outlet ${currentOutlet.outlet_id}`
        );
      }
    }
  }, [currentOutlet, refreshCurrentOutlet, queryClient]);

  // Get already selected outlet IDs for the selector
  const getAlreadySelectedOutletIds = useCallback(() => {
    const currentId = currentOutlet?.outlet_id?.toString();
    const selectedIds = selectedOutlets.map((o) => o.outlet_id.toString());
    return [currentId, ...selectedIds].filter(Boolean);
  }, [currentOutlet, selectedOutlets]);

  // Breadcrumb items
  const breadcrumbItems = [
    { text: "Home", url: "/" },
    { text: "Compare Outlets" },
  ];

  // If no outlet is selected, show warning
  if (!hasOutlet) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Compare Outlets
        </h1>
        {warningElement}
        <p className="text-gray-600 mt-4">
          Please select an outlet to start comparison.
        </p>
      </div>
    );
  }

  // Function to clear specific items from cache or force refresh them
  const invalidateOutletCache = useCallback(
    (outletId = null, forceRefresh = false) => {
      const userId = localStorage.getItem("user_id");

      if (outletId) {
        // Invalidate specific outlet
        queryClient.invalidateQueries({
          queryKey: outletCompareKeys.detail({
            user_id: Number(userId),
            outlet_id: Number(outletId),
          }),
        });

        if (forceRefresh && currentOutlet?.outlet_id === outletId) {
          refreshCurrentOutlet();
        }
      } else {
        // Invalidate all outlet comparisons
        queryClient.invalidateQueries({
          queryKey: outletCompareKeys.root,
        });

        if (forceRefresh && currentOutlet?.outlet_id) {
          refreshCurrentOutlet();
        }
      }
    },
    [currentOutlet, refreshCurrentOutlet, queryClient]
  );

  // Update the RefreshButton component to use queryClient invalidation
  const RefreshButton = () => (
    <button
      onClick={() => {
        // Refresh current outlet
        refreshCurrentOutlet();

        // Refresh selected outlets using queryClient invalidation
        selectedOutlets.forEach((outlet) => {
          queryClient.invalidateQueries({
            queryKey: outletCompareKeys.detail({
              user_id: Number(localStorage.getItem("user_id")),
              outlet_id: Number(outlet.outlet_id),
            }),
          });
        });

        // Re-fetch data for all selected outlets
        const refreshOutlets = async () => {
          setIsLoading(true);
          const refreshedOutlets = [];

          for (const outlet of selectedOutlets) {
            const data = await fetchOutletCompareDetails(outlet.outlet_id);
            if (data) {
              refreshedOutlets.push({
                ...outlet,
                ...data,
              });
            } else {
              refreshedOutlets.push(outlet);
            }
          }

          setSelectedOutlets(refreshedOutlets);
          setIsLoading(false);
        };

        refreshOutlets();
      }}
      className="group h-9 w-9 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:outline-none border border-gray-300 hidden md:flex ml-4"
      disabled={isLoading || isLoadingComparison}
    >
      <svg
        className="w-5 h-5"
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
    </button>
  );

  // Debug component lifecycle
  useEffect(() => {
    console.log("[CompareOutlets] Component mounted");

    return () => {
      console.log("[CompareOutlets] Component unmounted");
    };
  }, []);

  const isPageLoading = isLoading || isLoadingComparison;

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="space-y-4 p-2 sm:p-3">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="bg-white p-3 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-3 p-1 rounded-full hover:bg-gray-100"
                aria-label="Go back"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 00/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-800">
                Compare Outlets
              </h1>
            </div>

            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ml-2 ${
                  selectedOutlets.length === MAX_COMPARE_OUTLETS
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {selectedOutlets.length} of {MAX_COMPARE_OUTLETS} outlets
                selected
              </span>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 p-3 bg-white border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Comparison Results Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border-gray-200">
              <thead>
                <tr className="bg-gray-50 divide-x divide-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-64 border-b border-gray-200">
                    METRICS
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    CURRENT OUTLET
                  </th>

                  {/* Headers for selected outlets */}
                  {selectedOutlets.map((outlet, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                    >
                      <div className="flex justify-between items-center">
                        <span>{outlet.name}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleRefreshOutlet(idx)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded border border-gray-300 mx-2"
                            title="Change outlet"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </button> 
                          <button
                            onClick={() => handleRemoveOutlet(idx)}
                            className="text-red-600 hover:text-red-800 p-1 rounded border border-gray-300 mx-2"
                            title="Remove outlet"
                          > 
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 00/svg"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}

                  {/* Add outlet column if not at maximum */}
                  {selectedOutlets.length < MAX_COMPARE_OUTLETS && (
                    <th className="px-4 py-3 text-center border-b border-gray-200">
                      <button
                        onClick={handleOpenOutletSelector}
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                        disabled={isPageLoading}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Select Outlet
                      </button>
                    </th>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {/* Outlet Details Row */}
                <tr className="divide-x divide-gray-200">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
                    OUTLET DETAILS
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {currentOutletComparisonData.name ||
                              currentOutlet?.name ||
                              "Current Outlet"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentOutletComparisonData.address ||
                              currentOutlet?.address ||
                              "Address not available"}
                          </p>
                        </div>
                      </div>
                      <RefreshButton
                        onRefresh={refreshCurrentOutlet}
                        route="/outlet-details"
                        size="sm"
                        borderRadius="full"
                        showOnMobile={true}
                        additionalClasses="ml-2"
                      />
                    </div>
                  </td>

                  {/* Outlet details for selected outlets */}
                  {selectedOutlets.map((outlet, idx) => (
                    <td key={idx} className="px-4 py-3">
                      <div className="flex justify-between">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-green-100 w-8 h-8 rounded-full flex items-center justify-center text-green-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {outlet.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {outlet.address ||
                                outlet.location ||
                                "Address not available"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            // Invalidate the cache for this specific outlet
                            queryClient.invalidateQueries({
                              queryKey: outletCompareKeys.detail({
                                user_id: Number(
                                  localStorage.getItem("user_id")
                                ),
                                outlet_id: Number(outlet.outlet_id),
                              }),
                            });

                            // Fetch fresh data for this outlet
                            const freshData = await fetchOutletCompareDetails(
                              outlet.outlet_id
                            );
                            if (freshData) {
                              // Update only this outlet's data in the selectedOutlets array
                              setSelectedOutlets((prev) =>
                                prev.map((o, i) =>
                                  i === idx
                                    ? {
                                        ...o,
                                        ...freshData,
                                      }
                                    : o
                                )
                              );
                            }
                          }}
                          className="group h-9 w-9 rounded-full flex items-center justify-center text-gray-600 hover:text-primary-600 hover:bg-gray-50 focus:outline-none border border-gray-300 hidden md:flex ml-4"
                          title="Refresh outlet data"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                      </div>
                    </td>
                  ))}

                  {/* Empty cell if not at maximum */}
                  {selectedOutlets.length < MAX_COMPARE_OUTLETS && (
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-400 text-xs italic">
                        Select an outlet to compare
                      </span>
                    </td>
                  )}
                </tr>

                {/* Generate rows for each metric */}
                {metrics.map((metric) => {
                  const currentValue = getNestedValue(
                    currentOutletComparisonData,
                    metric.id
                  );
                  return (
                    <tr
                      key={metric.id}
                      className="divide-x divide-gray-200 bg-white"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {metric.name}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatValue(currentValue, metric.type)}
                      </td>

                      {/* Values for selected outlets */}
                      {selectedOutlets.map((outlet, idx) => {
                        const outletValue = getNestedValue(outlet, metric.id);
                        return (
                          <td
                            key={idx}
                            className="px-4 py-3 text-sm font-medium text-gray-900"
                          >
                            {formatValue(outletValue, metric.type)}
                          </td>
                        );
                      })}

                      {/* Empty cell if not at maximum */}
                      {selectedOutlets.length < MAX_COMPARE_OUTLETS && (
                        <td className="px-4 py-3"></td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Outlet Selector Modal */}
      <OutletSelector
        isOpen={isOutletSelectorOpen}
        onClose={() => {
          setIsOutletSelectorOpen(false);
          setRefreshOutletIndex(null);
        }}
        onSelect={handleOutletSelect}
        excludedOutletIds={getAlreadySelectedOutletIds()}
        updateContextOnSelect={false}
      />
    </div>
  );
}