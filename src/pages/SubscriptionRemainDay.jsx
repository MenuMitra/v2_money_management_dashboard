import React, { useMemo } from "react";
import { useOutletSubscription } from "../hooks/queries/useOutletSubscription";

const SubscriptionRemainDay = () => {
  const outletId = localStorage.getItem("outlet_id");
  const userId = localStorage.getItem("user_id");

  const {
    data: outletData,
    isLoading,
    error,
  } = useOutletSubscription(
    {
      outlet_id: outletId,
      user_id: userId,
    },
    {
      enabled: Boolean(outletId && userId),
      refetchOnWindowFocus: false,
    }
  );

  const subscriptionData = useMemo(() => {
    // Check for subscription_details first (new structure), then fall back to subscription (old structure)
    const subscriptionDetails = outletData?.subscription_details;
    const subscription = outletData?.subscription;
    
    // Determine which data structure to use
    const startDateStr = subscriptionDetails?.subscription_start_date || subscription?.start_date;
    const endDateStr = subscriptionDetails?.subscription_end_date || subscription?.end_date;
    
    if (!startDateStr || !endDateStr) {
      return null;
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const now = new Date();

    // Calculate total days in subscription
    const total = Math.max(0, Math.ceil((end - start) / msPerDay));

    // Calculate remaining days from now to end date
    const remaining = Math.max(0, Math.ceil((end - now) / msPerDay));

    // Calculate elapsed days (completed portion)
    const elapsed = Math.max(0, total - remaining);

    // Calculate percentage of timeline filled (completed portion)
    const percentage = total > 0
      ? Math.min(100, Math.max(0, (elapsed / total) * 100))
      : 0;

    // Choose progress bar color based on remaining days:
    // - <=5 days: red (urgent)
    // - <=15 days: orange (warning)
    // - >15 days: green (healthy)
    let color = "#177841"; // Green (default)
    if (remaining <= 5) {
      color = "#EF4444"; // Red
    } else if (remaining <= 15) {
      color = "#F59E0B"; // Orange
    }

    return {
      subscription: subscriptionDetails || subscription,
      totalDays: total,
      remainingDays: remaining,
      completedDays: elapsed,
      percentage,
      color,
      isExpired: remaining <= 0,
    };
  }, [outletData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Subscription Timeline
          </h3>
        </div>
        <div className="p-5">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subscriptionData) {
    // Check if we have subscription_details but no valid dates
    const hasSubscriptionDetails = outletData?.subscription_details?.subscription_start_date && 
                                    outletData?.subscription_details?.subscription_end_date;
    const hasSubscription = outletData?.subscription?.start_date && 
                            outletData?.subscription?.end_date;
    
    if (!hasSubscriptionDetails && !hasSubscription) {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              Subscription Timeline
            </h3>
          </div>
          <div className="p-5">
            <div className="text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>No subscription data available</p>
            </div>
          </div>
        </div>
      );
    }
    // If we have data but calculation failed, still show error
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">
            Subscription Timeline
          </h3>
        </div>
        <div className="p-5">
          <div className="text-center text-gray-500">
            <p>Unable to calculate subscription timeline</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    subscription,
    totalDays,
    remainingDays,
    completedDays,
    percentage,
    color,
    isExpired,
  } = subscriptionData;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = () => {
    if (isExpired) return "text-red-600";
    if (remainingDays <= 5) return "text-red-600";
    if (remainingDays <= 15) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusText = () => {
    if (isExpired) return "Expired";
    if (remainingDays <= 5) return "Expiring Soon";
    if (remainingDays <= 15) return "Expiring";
    return "Active";
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Timeline</h3>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-5 bg-slate-100 rounded-[10px] overflow-hidden">
            <div
              className="h-full flex items-center justify-center text-white font-bold text-xs rounded-[10px] transition-[width] duration-[800ms] ease-in-out border-0"
              role="progressbar"
              style={{
                // Fill shows completed portion of subscription
                width: `${percentage}%`,
                backgroundColor: color,
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
              aria-valuenow={percentage}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              &nbsp;
            </div>
          </div>
        </div>
        {/* Timeline Labels */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {completedDays} days completed
            </div>
          </div>
          <div className="text-center">
            <div
              className={`font-medium ${
                remainingDays <= 5
                  ? "text-red-600 font-bold text-lg"
                  : "text-black"
              }`}
            >
              {remainingDays} days Remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SubscriptionRemainDay };
