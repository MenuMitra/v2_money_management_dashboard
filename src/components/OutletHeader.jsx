import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useOutlet } from "../context/OutletContext";
import { useAuth } from "../context/AuthContext";
import OutletSelector from "./OutletSelector";
import DateRangePicker from "./DateRangePicker";
import { useLocation } from "react-router-dom";
import RefreshButton from "./common/RefreshButton";

const OutletHeader = () => {
  const { currentOutlet, loading, updateCurrentOutlet, clearCurrentOutlet } =
    useOutlet();
  const { logout, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    // Load persisted date range from localStorage on component mount
    const persisted = localStorage.getItem("statistics_date_range");
    if (persisted) {
      try {
        return JSON.parse(persisted);
      } catch (e) {
        console.warn("Failed to parse persisted date range:", e);
      }
    }
    return { type: "today" };
  });
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [refreshCooldown, setRefreshCooldown] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  const role = localStorage.getItem("role") || "User";
  const userName = localStorage.getItem("user_name") || "User";
  const userId = localStorage.getItem("user_id");
  const userEmail = localStorage.getItem("user_email") || localStorage.getItem("mobile_number") || "";

  // Store the current user ID to detect changes
  const userIdRef = useRef(userId);

  // Check if current page is Statistics
  const isStatisticsPage = location.pathname === "/statistics";

  // Handle clicks outside to close the logout dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // Listen for loading state changes from Statistics page
  useEffect(() => {
    const handleLoadingStart = () => {
      console.log("Statistics data loading started");
      setIsDataLoading(true);
    };

    const handleLoadingEnd = () => {
      console.log("Statistics data loading ended");
      setIsDataLoading(false);

      // Start the cooldown period
      setRefreshCooldown(true);
      setTimeout(() => {
        setRefreshCooldown(false);
      }, 10000); // 10 seconds cooldown
    };

    const handleOpenOutletSelector = () => {
      console.log("Opening outlet selector from modal");
      setIsModalOpen(true);
    };

    window.addEventListener("statistics:loading:start", handleLoadingStart);
    window.addEventListener("statistics:loading:end", handleLoadingEnd);
    window.addEventListener("open:outlet:selector", handleOpenOutletSelector);

    return () => {
      window.removeEventListener(
        "statistics:loading:start",
        handleLoadingStart
      );
      window.removeEventListener("statistics:loading:end", handleLoadingEnd);
      window.removeEventListener(
        "open:outlet:selector",
        handleOpenOutletSelector
      );
    };
  }, []);

  // Check if the user ID has changed (indicating a login with a different user)
  useEffect(() => {
    const currentUserId = localStorage.getItem("user_id");

    // If user ID changed, clear the outlet selection
    if (userIdRef.current !== currentUserId) {
      console.log("User changed, clearing outlet selection");
      clearCurrentOutlet();
      userIdRef.current = currentUserId;
    }
  }, [user, clearCurrentOutlet]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectOutlet = (outlet) => {
    updateCurrentOutlet(outlet);
    // Reset date range to 'today' when outlet changes
    const newDateRange = { type: "today" };
    setDateRange(newDateRange);

    // Persist the reset date range
    localStorage.setItem("statistics_date_range", JSON.stringify(newDateRange));

    // Dispatch an event to notify other components that the outlet has changed
    const event = new CustomEvent("outlet:changed", { detail: outlet });
    window.dispatchEvent(event);
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);

    // Persist the date range to localStorage
    localStorage.setItem("statistics_date_range", JSON.stringify(range));

    // Dispatch a custom event that components can listen for
    const event = new CustomEvent("daterange:changed", { detail: range });
    window.dispatchEvent(event);
  };

  // Update handleRefresh to return a Promise and handle SPA refresh
  const handleRefresh = async () => {
    try {
      // If already loading or in cooldown, don't allow refresh
      if (isDataLoading || refreshCooldown) {
        console.warn(
          "Refresh action blocked: " +
            (isDataLoading ? "Data is still loading" : "In cooldown period")
        );
        return Promise.resolve();
      }

      // Dispatch refresh request event before starting the refresh
      window.dispatchEvent(new CustomEvent("refresh:requested"));

      // Dispatch events to refresh data
      window.dispatchEvent(
        new CustomEvent("daterange:changed", {
          detail: dateRange,
        })
      );

      if (currentOutlet) {
        window.dispatchEvent(
          new CustomEvent("outlet:changed", {
            detail: currentOutlet,
          })
        );
      }

      return Promise.resolve();
    } catch (error) {
      console.error("Error refreshing data:", error);
      setIsDataLoading(false);
      window.dispatchEvent(new CustomEvent("statistics:loading:end"));
      return Promise.reject(error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogout(false); // Close the dropdown
    setShowLogoutConfirm(true); // Show confirmation modal
  };

  const handleConfirmLogout = () => {
    // Clear persisted date range on logout
    localStorage.removeItem("statistics_date_range");
    setShowLogoutConfirm(false); // Close the modal
    logout();
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false); // Close the modal
  };

  const toggleLogout = () => {
    setShowLogout(!showLogout);
  };

  return (
    <div className="h-16 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {/* Outlet selector button */}
          <button
            onClick={handleOpenModal}
            className="flex items-center h-9 px-3 text-sm font-medium text-gray-700 focus:outline-none border border-gray-300 rounded-md bg-white hover:bg-gray-50 justify-between min-w-[150px] mr-3"
          >
            <div className="flex items-center">
              {loading ? (
                <span className="animate-pulse">Loading...</span>
              ) : currentOutlet ? (
                <span className="font-medium truncate capitalize">
                  {currentOutlet.name}
                </span>
              ) : (
                <span>Select Outlet</span>
              )}
            </div>

            <svg
              className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Date Range Picker - always visible when outlet is selected but only enabled on Statistics page */}
          {currentOutlet && (
            <>
              {isStatisticsPage && (
                <div className="hidden md:block ml-4">
                  <DateRangePicker
                    onChange={handleDateRangeChange}
                    initialValue="today"
                  />
                </div>
              )}
              {currentOutlet && (
                <RefreshButton
                  onRefresh={handleRefresh}
                  route={location.pathname}
                  additionalClasses="ml-4"
                  showOnMobile={false}
                  size="md"
                  isDataLoading={isDataLoading}
                  disabled={isDataLoading || refreshCooldown}
                />
              )}
            </>
          )}
        </div>

        {/* Right section with refresh button and profile */}
        <div className="flex items-center gap-3 h-9">
          {/* Profile with Role - always visible */}
          <div
            ref={profileRef}
            className="relative flex items-center h-9"
            onClick={toggleLogout}
          >
            <div className="flex flex-row items-center cursor-pointer">
              <div className="text-sm hidden md:block mr-2">
                <p className="text-gray-700 font-medium leading-tight capitalize">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 capitalize leading-tight">
                  {role}
                </p>
              </div>
              <div className="md:h-7 md:w-7 h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
                {/* Show initial on mobile, icon on desktop */}
                <span className="font-medium md:hidden">
                  {userName.charAt(0).toUpperCase()}
                </span>
                <svg
                  className="h-4 w-4 hidden md:block"
                  xmlns="http://www.w3.org/2000/svg"
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
              </div>
              <div className="text-sm md:hidden ml-2">
                <p className="text-gray-700 font-medium leading-tight capitalize">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 capitalize leading-tight">
                  {role}
                </p>
              </div>
            </div>

            {/* Improved Logout dropdown that appears on click */}
            {showLogout && (
              <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md py-2 z-50 border border-gray-200 w-56">
                {/* User Information Section */}
                <div className="px-4 py-2">
                  <p className="text-sm font-semibold text-gray-800 leading-tight capitalize">
                    {userName}
                  </p>
                  {userEmail && (
                    <p className="text-xs text-gray-600 leading-tight mt-1">
                      {userEmail}
                    </p>
                  )}
                </div>
                
                {/* Separator */}
                <div className="border-t border-gray-200 my-1"></div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100 hover:text-red-700 transition-colors focus:outline-none"
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faRightFromBracket}
                      className="h-4 w-4 mr-2"
                    />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OutletSelector
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelect={handleSelectOutlet}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            {/* Header Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className="h-5 w-5 text-red-600 mr-3"
                />
                <h3 className="text-lg font-semibold text-gray-800">
                  Confirm Logout
                </h3>
              </div>
            </div>

            {/* Message Section */}
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-700 text-center">
                Are you sure you want to logout?
              </p>
            </div>

            {/* Action Buttons Section */}
            <div className="px-6 py-4 flex justify-between gap-3">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center"
              >
                <FontAwesomeIcon
                  icon={faRightFromBracket}
                  className="h-4 w-4 mr-2"
                />
                Exit Me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletHeader;
