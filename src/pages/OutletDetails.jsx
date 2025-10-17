import React, { useState, useEffect, useCallback, useRef } from "react";
import { useOutlet } from "../context/OutletContext";
import { useCacheData } from "../context/CacheDataContext";
import { API_PATHS } from "../api/index";
import { useOutletWarning } from "../hooks/useOutletId.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components";
import { useOutletDetails } from "../hooks/queries/useOutletDetails";

export default function OutletDetails() {
  const [currentOutletId, setCurrentOutletId] = useState(
    localStorage.getItem("outlet_id")
  );
  const [error, setError] = useState(null);
  const prevOutletIdRef = useRef(null);
  const isInitialMount = useRef(true);
  const outletChangeRef = useRef(false);
  const navigate = useNavigate();

  const { currentOutlet, loading: outletLoading } = useOutlet();
  const { hasOutlet, warningElement } = useOutletWarning();

  const {
    data: outletData = {
      name: "",
      address: "",
      outlet_status: false,
      mobile: "",
      outlet_type: "",
      veg_nonveg: "",
      created_on: "",
      opening_time: "",
      closing_time: "",
      outlet_code: "",
      owner_id: "",
      owners: [],
      menu_counts: { total: 0, active: 0, inactive: 0 },
      menu_category_counts: { total: 0, active: 0, inactive: 0 },
      section_counts: { total: 0, active: 0, inactive: 0 },
      table_counts: { total: 0, active: 0, inactive: 0 },
      waiter_counts: { total: 0, active: 0, inactive: 0 },
      captain_counts: { total: 0, active: 0, inactive: 0 },
      manager_counts: { total: 0, active: 0, inactive: 0 },
      chef_counts: { total: 0, active: 0, inactive: 0 },
      Inventory_Items_counts: { total: 0, active: 0, inactive: 0 },
      Inventory_Category_counts: { total: 4, active: 3, inactive: 1 },
      Inventory_Sub_Category_counts: { total: 6, active: 4, inactive: 2 },
      supplier_counts: { total: 0, active: 0, inactive: 0 },
      order_statistics: {
        total_days_since_menumitra_was_installed: 0,
        total_orders_since_menumitra_was_installed: 0,
        total_revenue: 0,
        first_order_date: "",
      },
    },
    isLoading: isLoadingOutletDetails,
    error: outletDetailsError,
    refetch: refetchOutletDetails,
  } = useOutletDetails(
    {
      outlet_id: currentOutletId,
      user_id: localStorage.getItem("user_id"),
    },
    {
      refetchOnWindowFocus: true,
      onError: (error) => {
        console.error("Error fetching outlet details:", error);
        setError(error.message || "Failed to load outlet details");
      },
    }
  );

  const isPageLoading = outletLoading || isLoadingOutletDetails;

  const isEmpty = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "N/A"
    )
      return true;
    if (typeof value === "number" && value === 0) return true;
    if (typeof value === "string" && value.trim() === "0") return true;
    if (typeof value === "string" && value.trim().toLowerCase() === "n/a")
      return true;
    return false;
  };

  const hasAnyValue = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    return Object.values(obj).some((value) => {
      if (typeof value === "object" && value !== null) {
        return hasAnyValue(value);
      }
      return !isEmpty(value);
    });
  };

  const formatIndianCurrency = (amount) => {
    if (!amount) return "₹0";

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

  const formatTime = (raw) => {
    if (!raw) return "N/A";

    const value = String(raw).trim();

    // Helper to format 24h -> 12h with AM/PM
    const to12h = (h24, m) => {
      const hoursNum = Number(h24);
      const minutes = String(m).padStart(2, "0");
      if (Number.isNaN(hoursNum)) return null;
      const ampm = hoursNum >= 12 ? "PM" : "AM";
      const hour12 = hoursNum % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    // Case 1: Explicit 12h with AM/PM e.g. "03:29:00 PM" or "4:22 pm"
    const match12h = value.match(
      /^(?:.*?\b)?(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)\b/i
    );
    if (match12h) {
      let [, h, m, ap] = match12h;
      // Normalize hour to 1-12 and minutes 00-59
      let hourNum = Number(h);
      if (hourNum <= 0) hourNum = 12;
      if (hourNum > 12) hourNum = hourNum % 12 || 12;
      const minutes = String(m).padStart(2, "0");
      const ampm = ap.toUpperCase();
      return `${hourNum}:${minutes} ${ampm}`;
    }

    // Case 2: ISO or date-time like "2025-09-29T11:48:13" or "2025-09-29 15:04:05"
    const matchIso = value.match(/\b(\d{2}):(\d{2})(?::\d{2})\b/);
    if (matchIso) {
      const [, h, m] = matchIso;
      const formatted = to12h(h, m);
      if (formatted) return formatted;
    }

    // Case 3: Plain 24h time like "15:30" or "09:05"
    const match24h = value.match(/^\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*$/);
    if (match24h) {
      const [, h, m] = match24h;
      const formatted = to12h(h, m);
      if (formatted) return formatted;
    }

    // Fallback: return as-is
    return value || "N/A";
  };

  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!currentOutlet?.outlet_id) return;

    const numericOutletId = parseInt(currentOutlet.outlet_id, 10);
    const numericPreviousOutletId = prevOutletIdRef.current;

    if (numericPreviousOutletId !== numericOutletId) {
      console.log(
        `OutletDetails: Outlet changed in context from ${numericPreviousOutletId} to ${numericOutletId}`
      );
      setCurrentOutletId(currentOutlet.outlet_id);
      prevOutletIdRef.current = numericOutletId;
    }
  }, [currentOutlet?.outlet_id]);

  useEffect(() => {
    const handleOutletChange = (newOutletId) => {
      if (!newOutletId) return;

      const numericNewOutletId = parseInt(newOutletId, 10);
      const numericPrevOutletId = prevOutletIdRef.current;

      if (numericNewOutletId === numericPrevOutletId) return;

      console.log(`OutletDetails: Outlet changed to ${newOutletId} via event`);
      setCurrentOutletId(newOutletId);
    };

    const onCustomEvent = (e) => {
      const newOutletId =
        e.detail?.outletId || localStorage.getItem("outlet_id");
      handleOutletChange(newOutletId);
    };

    const onStorageChange = (e) => {
      if (e.key === "outlet_id") {
        handleOutletChange(e.newValue);
      }
    };

    window.addEventListener("outlet:changed", onCustomEvent);
    window.addEventListener("storage", onStorageChange);

    return () => {
      window.removeEventListener("outlet:changed", onCustomEvent);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  const FoodTypeIndicator = ({ type }) => {
    if (!type) return null;

    const normalizedType = type.toLowerCase().trim();

    if (normalizedType === "veg") {
      return (
        <span className="inline-block w-3 h-3 rounded-full bg-green-500 ml-2"></span>
      );
    }

    if (normalizedType === "non-veg" || normalizedType === "nonveg") {
      return (
        <span className="inline-block w-3 h-3 rounded-full bg-red-500 ml-2"></span>
      );
    }

    return null;
  };

  const StatItem = ({ label, value }) => {
    if (isEmpty(value)) return null;

    return (
      <div className="bg-white border border-gray-100 rounded-md p-4">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-xl font-medium">{value}</p>
      </div>
    );
  };

  const CountsSection = ({ title, data, isLoading = false }) => {
    // Log inventory counts for debugging
    if (title === "Inventory Information") {
      console.log("Inventory Counts Data:", {
        Inventory_Category: data.Inventory_Category,
        Inventory_Sub_Category: data.Inventory_Sub_Category,
        supplier: data.supplier,
      });
    }

    if (!isLoading) {
      const hasAnyData = Object.values(data).some(
        (countData) =>
          countData?.total > 0 ||
          countData?.active >= 0 ||
          countData?.inactive >= 0
      );

      if (!hasAnyData) return null;
    }

    const sections = Object.entries(data).filter(
      ([key, countData]) =>
        isLoading ||
        countData?.total > 0 ||
        countData?.active >= 0 ||
        countData?.inactive >= 0
    );

    if (sections.length === 0) return null;

    const sectionIcons = {
      menu: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      menu_category: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      section: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-purple-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      table: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
      waiter: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      captain: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-yellow-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      manager: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-pink-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      chef: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-orange-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
          />
        </svg>
      ),
      Inventory_Items: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-teal-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      Inventory_Category: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-cyan-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      Inventory_Sub_Category: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-sky-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      supplier: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-lime-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
          />
        </svg>
      ),
    };

    const getSectionIcon = (key) => {
      return (
        sectionIcons[key] || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        )
      );
    };

    const getTitleIcon = () => {
      if (title.includes("Menu")) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      } else if (title.includes("Staff")) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      } else if (title.includes("Inventory")) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      }
      return null;
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            {getTitleIcon()}
            {title}
          </h2>
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {sections.length} {sections.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sections.map(([key, countData]) => {
            const displayKey = key
              .replace(/([A-Z])/g, " $1")
              .replace(/_counts$/, "")
              .replace(/_/g, " ")
              .trim();

            // Ensure counts are numbers, default to 0 only if explicitly null/undefined
            let totalCount = Number(countData?.total ?? 0);
            // For tables, map to available/occupied; for others, use active/inactive
            let activeCount =
              key === "table"
                ? Number(countData?.available ?? 0)
                : Number(countData?.active ?? 0);
            let inactiveCount =
              key === "table"
                ? Number(countData?.occupied ?? 0)
                : Number(countData?.inactive ?? 0);

            // Adjust supplier counts to ensure all are active
            if (key === "supplier") {
              inactiveCount = 0;
              activeCount = totalCount;
            }

            // Warn if active + inactive doesn't match total for non-Inventory_Items sections
            if (
              !isLoading &&
              key !== "Inventory_Items" &&
              totalCount > 0 &&
              activeCount + inactiveCount !== totalCount
            ) {
              console.warn(
                `Data inconsistency in ${displayKey}: total=${totalCount}, active=${activeCount}, inactive=${inactiveCount}`
              );
            }

            return (
              <div
                key={key}
                className="bg-white p-4 rounded-lg border border-gray-200 transition-all hover:shadow-md flex flex-col"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    {getSectionIcon(key)}
                    <p className="text-sm font-medium text-gray-700 capitalize ml-2">
                      {displayKey}
                    </p>
                  </div>
                  <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-800">
                      {isLoading ? "0" : totalCount}
                    </span>
                  </div>
                </div>

                {key !== "Inventory_Items" && (
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                          <span className="text-xs text-gray-500">
                            {key === "table" ? "Available" : "Active"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          {isLoading ? "0" : activeCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></div>
                          <span className="text-xs text-gray-500">
                            {key === "table" ? "Occupied" : "Inactive"}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-red-500">
                          {isLoading ? "0" : inactiveCount}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const UsageStatsSection = ({ data, isLoading = false }) => {
    if (!isLoading) {
      const hasData =
        data &&
        (data.total_days_since_menumitra_was_installed > 0 ||
          data.total_orders_since_menumitra_was_installed > 0 ||
          data.total_revenue > 0 ||
          (data.first_order_date && data.first_order_date !== "N/A"));

      if (!hasData) return null;
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            MenuMitra Usage
          </h2>
          <span className="bg-green-50 text-green-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Statistics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {(isLoading ||
            data?.total_days_since_menumitra_was_installed > 0) && (
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col relative">
                <span className="text-sm text-blue-700 mb-1 font-medium">
                  Days Since Installation
                </span>
                <span className="text-2xl font-semibold text-blue-900">
                  {isLoading
                    ? "0"
                    : data?.total_days_since_menumitra_was_installed || 0}
                </span>
              </div>
            </div>
          )}

          {(isLoading ||
            data?.total_orders_since_menumitra_was_installed > 0) && (
            <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div className="flex flex-col relative">
                <span className="text-sm text-green-700 mb-1 font-medium">
                  Total Orders
                </span>
                <span className="text-2xl font-semibold text-green-900">
                  {isLoading
                    ? "0"
                    : parseInt(
                        data?.total_orders_since_menumitra_was_installed || 0
                      ).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {(isLoading || data?.total_revenue > 0) && (
            <div className="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-purple-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col relative">
                <span className="text-sm text-purple-700 mb-1 font-medium">
                  Total Revenue
                </span>
                <span className="text-2xl font-semibold text-purple-900">
                  {isLoading
                    ? "₹0"
                    : formatIndianCurrency(data?.total_revenue || 0)}
                </span>
              </div>
            </div>
          )}

          {(isLoading ||
            (data?.first_order_date && data?.first_order_date !== "N/A")) && (
            <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200 overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-amber-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col relative">
                <span className="text-sm text-amber-700 mb-1 font-medium">
                  First Order Date
                </span>
                <span className="text-2xl font-semibold text-amber-900">
                  {isLoading ? "N/A" : data?.first_order_date || "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const OwnersSection = ({ owners = [], isLoading = false }) => {
    if (!isLoading && (!owners || owners.length === 0)) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
          <h2 className="text-lg font-medium text-gray-800 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Outlet Owners
          </h2>
          <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {isLoading ? "0" : owners.length}{" "}
            {owners.length === 1 ? "Owner" : "Owners"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-100 flex items-center">
              <div className="animate-pulse flex space-x-4 w-full">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ) : (
            owners.map((owner) => (
              <div
                key={owner.owner_id}
                className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-semibold">
                    {owner.owner_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {owner.owner_name}
                    </p>
                    <div className="flex items-center mt-1">
                      {owner.is_primary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mr-1">
                          Primary
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          owner.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {owner.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const breadcrumbItems = [
    { text: "Home", url: "/" },
    { text: "Outlet Details" },
  ];

  if (!hasOutlet) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
          Outlet Details
        </h1>
        {warningElement}
        <p className="text-gray-600 mt-4">
          Please select an outlet to view outlet details.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-8">
      <div className="space-y-4 p-2 sm:p-3">
        <Breadcrumb items={breadcrumbItems} />

        {(error || outletDetailsError) && (
          <div className="mb-6 p-4 bg-white border border-red-200 rounded-lg bg-red-50">
            <p className="text-red-700">
              {error || outletDetailsError?.message}
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <button
                  onClick={() => navigate(-1)}
                  className="mr-3 p-1 rounded-full hover:bg-gray-100"
                  aria-label="Go back"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </button>
                Outlet Details
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-base font-medium">
                    {isPageLoading
                      ? "Outlet Name"
                      : outletData.name || "Outlet Name"}
                  </div>
                  {!isPageLoading && !isEmpty(outletData.outlet_status) && (
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        outletData.outlet_status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {outletData.outlet_status ? "Active" : "Inactive"}
                    </span>
                  )}
                </div>
                <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                  Outlet Name
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-base font-medium capitalize">
                    {isPageLoading ? "N/A" : outletData.outlet_type || "N/A"}
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                  Outlet Type
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-base font-medium capitalize flex items-center">
                    {isPageLoading ? "N/A" : outletData.veg_nonveg || "N/A"}
                    {!isPageLoading && outletData.veg_nonveg && (
                      <FoodTypeIndicator type={outletData.veg_nonveg} />
                    )}
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                    />
                  </svg>
                </div>
                <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                  Food Type
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-base font-medium">
                    {isPageLoading ? "N/A" : outletData.outlet_code || "N/A"}
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 14"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                  Outlet Code
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {(isPageLoading || !isEmpty(outletData.mobile)) && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-base font-medium">
                      {isPageLoading ? "N/A" : outletData.mobile}
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                    Contact
                  </div>
                </div>
              )}

              {(isPageLoading || !isEmpty(outletData.created_on)) && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-base font-medium">
                      {isPageLoading ? "N/A" : outletData.created_on}
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                    Created On
                  </div>
                </div>
              )}

              {(isPageLoading ||
                !isEmpty(outletData.opening_time) ||
                !isEmpty(outletData.closing_time)) && (
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-base font-medium flex-1">
                      {isPageLoading ? (
                        "N/A - N/A"
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span>Opening:</span>
                            <span>
                              {!isEmpty(outletData.opening_time)
                                ? formatTime(outletData.opening_time)
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span>Closing:</span>
                            <span>
                              {!isEmpty(outletData.closing_time)
                                ? formatTime(outletData.closing_time)
                                : "N/A"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                    Operating Hours
                  </div>
                </div>
              )}
            </div>

            {(isPageLoading || !isEmpty(outletData.address)) && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <div className="flex items-start justify-between mb-1">
                  <div className="text-base font-medium pr-2">
                    {isPageLoading ? "N/A" : toTitleCase(outletData.address)}
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="text-xs uppercase text-gray-500 tracking-wider font-medium">
                  Address
                </div>
              </div>
            )}
          </div>

          <OwnersSection owners={outletData.owners} isLoading={isPageLoading} />

          <UsageStatsSection
            data={outletData.order_statistics}
            isLoading={isPageLoading}
          />

          <CountsSection
            title="Menu Information"
            data={{
              menu: outletData.menu_counts || {},
              menu_category: outletData.menu_category_counts || {},
              section: outletData.section_counts || {},
              table: outletData.table_counts || {},
            }}
            isLoading={isPageLoading}
          />

          <CountsSection
            title="Staff Information"
            data={{
              waiter: outletData.waiter_counts || {},
              captain: outletData.captain_counts || {},
              manager: outletData.manager_counts || {},
              chef: outletData.chef_counts || {},
            }}
            isLoading={isPageLoading}
          />

          <CountsSection
            title="Inventory Information"
            data={{
              Inventory_Items: outletData.Inventory_Items_counts || {},
              Inventory_Category: outletData.Inventory_Category_counts || {},
              Inventory_Sub_Category:
                outletData.Inventory_Sub_Category_counts || {},
              supplier: outletData.supplier_counts || {},
            }}
            isLoading={isPageLoading}
          />
        </div>
      </div>
    </div>
  );
}
