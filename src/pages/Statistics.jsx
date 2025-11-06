import React, { useEffect, useState, useRef, useCallback } from "react";
import { FaXmark } from "react-icons/fa6";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faRupeeSign,
  faCalculator,
  faClock,
  faArrowLeft,
  faCalendarDays,
  faCircleXmark,
  faCheck,
  faXmark,
  faGift,
  faBook,
  faCreditCard,
  faHome,
  faTruck,
  faUtensils,
  faChartBar,
  faFileInvoiceDollar,
  faBolt,
  faCopy,
  faExclamationCircle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useStatistics } from "../api/statistics";
import ReactApexChart from "react-apexcharts";
import { useOutletId, useOutletWarning } from "../hooks/useOutletId";
import { Breadcrumb } from "../components";
import { useNavigate } from "react-router-dom";
import { getDateRangeFromType, formatDateForAPI } from "../utils/dateUtils";
import { SubscriptionRemainDay } from "./SubscriptionRemainDay";

// Tooltip Component for calculation explanations
const InfoTooltip = ({ content, className = "", preferredPosition = "right" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [position, setPosition] = useState(preferredPosition);
  const [arrowStyle, setArrowStyle] = useState({});
  const tooltipRef = useRef(null);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current || !tooltipRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipRef.current.offsetWidth || 320;
    const tooltipHeight = tooltipRef.current.offsetHeight || 200;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const spaceRight = viewportWidth - buttonRect.right;
    const spaceLeft = buttonRect.left;
    const spaceAbove = buttonRect.top;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const padding = 10; // Minimum padding from viewport edges

    let tooltipPosition = preferredPosition;
    let style = {};

    if (preferredPosition === "bottom") {
      // Bottom positioning - check if there's enough space below
      const neededSpace = tooltipHeight + 20;

      if (spaceBelow < neededSpace && spaceAbove > spaceBelow) {
        // Not enough space below, position above instead
        tooltipPosition = "top";
        const top = buttonRect.top - tooltipHeight - 8;

        // Calculate horizontal position
        let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;

        // Adjust if going off left edge
        if (left < padding) {
          left = padding;
        }
        // Adjust if going off right edge
        else if (left + tooltipWidth > viewportWidth - padding) {
          left = viewportWidth - tooltipWidth - padding;
        }

        // Calculate arrow position relative to tooltip
        const arrowLeft = buttonCenterX - left;

        style = {
          position: "fixed",
          top: `${Math.max(padding, top)}px`,
          left: `${left}px`,
          transform: "none",
        };

        setArrowStyle({
          left: `${Math.max(12, Math.min(arrowLeft, tooltipWidth - 12))}px`,
        });
      } else {
        // Position below
        tooltipPosition = "bottom";
        const top = buttonRect.bottom + 8;

        // Calculate horizontal position
        let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;

        // Adjust if going off left edge
        if (left < padding) {
          left = padding;
        }
        // Adjust if going off right edge
        else if (left + tooltipWidth > viewportWidth - padding) {
          left = viewportWidth - tooltipWidth - padding;
        }

        // Calculate arrow position relative to tooltip
        const arrowLeft = buttonCenterX - left;

        style = {
          position: "fixed",
          top: `${top}px`,
          left: `${left}px`,
          transform: "none",
        };

        setArrowStyle({
          left: `${Math.max(12, Math.min(arrowLeft, tooltipWidth - 12))}px`,
        });
      }
    } else {
      // Right/Left positioning
      if (spaceRight < tooltipWidth + 20 && spaceLeft > tooltipWidth + 20) {
        tooltipPosition = "left";
      }

      // Calculate vertical position
      let top = buttonRect.top + buttonRect.height / 2 - tooltipHeight / 2;

      // Adjust if going off top
      if (top < padding) {
        top = padding;
      }
      // Adjust if going off bottom
      else if (top + tooltipHeight > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
      }

      // Calculate horizontal position
      let left;
      if (tooltipPosition === "right") {
        left = buttonRect.right + 8;
        // If going off right edge, position to left instead
        if (left + tooltipWidth > viewportWidth - padding) {
          left = buttonRect.left - tooltipWidth - 8;
          tooltipPosition = "left";
        }
      } else {
        left = buttonRect.left - tooltipWidth - 8;
        // If going off left edge, position to right instead
        if (left < padding) {
          left = buttonRect.right + 8;
          tooltipPosition = "right";
        }
      }

      style = {
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        transform: "none",
      };

      // For right/left positioning, arrow is centered vertically
      setArrowStyle({});
    }

    setPosition(tooltipPosition);
    setTooltipStyle(style);
  }, [preferredPosition]);

  const handleMouseEnter = () => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(true);
    // Calculate position after a brief delay to allow DOM to update
    setTimeout(() => {
      calculatePosition();
    }, 10);
  };

  const handleMouseLeave = () => {
    // Add a small delay before closing to allow moving to tooltip
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      timeoutRef.current = null;
    }, 150);
  };

  // Recalculate position on scroll or resize
  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();

      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isVisible, calculatePosition]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef} style={{ zIndex: 1 }}>
      <button
        ref={buttonRef}
        type="button"
        className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          if (!isVisible) {
            handleMouseEnter();
          } else {
            setIsVisible(false);
          }
        }}
        aria-label="Show calculation info"
      >
        <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4" />
      </button>
      {isVisible && content && (
        <div
          ref={tooltipRef}
          className="fixed w-80 max-w-[90vw] p-3 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg shadow-xl"
          style={{
            ...tooltipStyle,
            zIndex: 99999,
            maxHeight: "400px",
            overflowY: "auto",
            pointerEvents: "auto",
          }}
          onMouseEnter={() => {
            // Clear timeout when entering tooltip
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            setIsVisible(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="whitespace-pre-line leading-relaxed">{content}</div>
          {/* Arrow pointing to the button */}
          {position === "bottom" ? (
            <>
              <div
                className="absolute -top-2 transform -translate-x-1/2"
                style={{
                  ...arrowStyle,
                  width: 0,
                  height: 0,
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderBottom: "9px solid #d1d5db",
                }}
              />
              <div
                className="absolute -top-1 transform -translate-x-1/2"
                style={{
                  ...arrowStyle,
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid white",
                }}
              />
            </>
          ) : position === "top" ? (
            <>
              <div
                className="absolute -bottom-2 transform -translate-x-1/2"
                style={{
                  ...arrowStyle,
                  width: 0,
                  height: 0,
                  borderLeft: "9px solid transparent",
                  borderRight: "9px solid transparent",
                  borderTop: "9px solid #d1d5db",
                }}
              />
              <div
                className="absolute -bottom-1 transform -translate-x-1/2"
                style={{
                  ...arrowStyle,
                  width: 0,
                  height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderTop: "8px solid white",
                }}
              />
            </>
          ) : position === "right" ? (
            <>
              <div
                className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "9px solid transparent",
                  borderBottom: "9px solid transparent",
                  borderRight: "9px solid #d1d5db",
                }}
              />
              <div
                className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderRight: "8px solid white",
                  marginLeft: "1px",
                }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "9px solid transparent",
                  borderBottom: "9px solid transparent",
                  borderLeft: "9px solid #d1d5db",
                }}
              />
              <div
                className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2"
                style={{
                  width: 0,
                  height: 0,
                  borderTop: "8px solid transparent",
                  borderBottom: "8px solid transparent",
                  borderLeft: "8px solid white",
                  marginRight: "1px",
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Food Type Chart Component
const FoodTypeChart = ({ foodTypeData }) => {
  // If no data, use empty data structure
  const chartData = foodTypeData || {
    monday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
    tuesday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
    wednesday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
    thursday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
    friday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
    saturday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
    sunday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
  };

  // Extract data from the foodTypeData object
  const allDays = Object.keys(chartData);
  const foodTypes = ["veg", "nonveg", "vegan", "egg"];

  // Filter out days that have zero values for all food types
  const daysWithData = allDays.filter((day) =>
    foodTypes.some((type) => chartData[day][type] > 0)
  );

  // If all days have zero values for all food types, use all days (default behavior)
  const daysToDisplay = daysWithData.length > 0 ? daysWithData : allDays;

  // Food type badge definitions with colors and labels
  const foodTypeBadges = {
    veg: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: "🟢",
      label: "Vegetarian",
    },
    nonveg: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: "🔴",
      label: "Non-Vegetarian",
    },
    vegan: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: "🟣",
      label: "Vegan",
    },
    egg: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: "🟡",
      label: "Egg",
    },
  };

  // Check which food types have non-zero values
  const foodTypeHasData = {};
  foodTypes.forEach((type) => {
    foodTypeHasData[type] = daysToDisplay.some(
      (day) => chartData[day][type] > 0
    );
  });

  // Filter food types to only include those with non-zero values
  const visibleFoodTypes = foodTypes.filter((type) => foodTypeHasData[type]);

  // If all food types have zero values, show all food types (default behavior)
  const typesToDisplay =
    visibleFoodTypes.length > 0 ? visibleFoodTypes : foodTypes;

  // Prepare series data for food types that have data
  const series = typesToDisplay.map((type) => {
    return {
      name:
        type === "veg"
          ? "Vegetarian"
          : type === "nonveg"
            ? "Non-Vegetarian"
            : type === "vegan"
              ? "Vegan"
              : "Egg",
      data: daysToDisplay.map((day) => chartData[day][type] || 0),
    };
  });

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      selection: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%", // Fixed column width regardless of data points
        endingShape: "rounded",
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: daysToDisplay.map(
        (day) => day.charAt(0).toUpperCase() + day.slice(1)
      ),
      labels: {
        style: {
          fontSize: "12px",
        },
      },
      tickPlacement: "on",
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Orders",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      followCursor: true,
      shared: true,
      intersect: false,
      fixed: { enabled: false },
      y: {
        formatter: function (val) {
          return val + " orders";
        },
      },
    },
    colors: ["#10B981", "#EF4444", "#F59E0B", "#F59E0B"],
    legend: {
      show: false,
    },
    grid: {
      padding: {
        left: 20,
        right: 20,
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">Food Types by Day</h3>
          <InfoTooltip
            content="Count of items sold by food type (veg/nonveg/vegan/egg) for each weekday, excluding cancelled orders"
          />
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Distribution of food types across days of the week
        </p>

        {/* Food Type Badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {typesToDisplay.map((type) => (
            <div
              key={type}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${foodTypeBadges[type].color}`}
            >
              <span className="mr-1">{foodTypeBadges[type].icon}</span>
              {foodTypeBadges[type].label}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

// Collection Sources Card Component
const CollectionSourcesCard = ({ collectionData }) => {
  // Use empty data if none provided
  const data = collectionData || {
    upi_amount: 0,
    cash_amount: 0,
    card_amount: 0,
    complementary_amount: 0,
    udhari_amount: 0,
    advance_payment_amount: 0,
    upi_orders: 0,
    cash_orders: 0,
    card_orders: 0,
    complementary_orders: 0,
    udhari_orders: 0,
    advance_payment_orders: 0,
    total_amount: 0,
    udhari_pending_amount: 0,
    udhari_paid_amount: 0,
    udhari_pending_orders: 0,
    udhari_paid_orders: 0,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Use the total from API response if available
  const hasTotal =
    data.total_amount !== undefined && data.total_amount !== null;
  const totalAmount = hasTotal ? data.total_amount : 0;

  // Prepare data for progress bars
  const paymentMethods = [
    {
      name: "UPI",
      amount: data.upi_amount || 0,
      orders: data.upi_orders || 0,
      color: "bg-indigo-500",
    },
    {
      name: "Cash",
      amount: data.cash_amount || 0,
      orders: data.cash_orders || 0,
      color: "bg-purple-500",
    },
    {
      name: "Card",
      amount: data.card_amount || 0,
      orders: data.card_orders || 0,
      color: "bg-yellow-500",
    },
    {
      name: "Complementary",
      amount: data.complementary_amount || 0,
      orders: data.complementary_orders || 0,
      color: "bg-pink-500",
    },
    {
      name: "Udhari Settle",
      amount: data.udhari_paid_amount || 0,
      orders: data.udhari_paid_orders || 0,
      color: "bg-green-500",
    },
    {
      name: "Advance Payment",
      amount: data.advance_payment_amount || 0,
      orders: data.advance_payment_orders || 0,
      color: "bg-indigo-500",
    },

    {
      name: "Udhari Pending",
      amount: data.udhari_pending_amount || 0,
      orders: data.udhari_pending_orders || 0,
      color: "bg-red-500",
    },
  ];

  // Filter out payment methods with zero amounts and orders
  const visiblePaymentMethods = paymentMethods.filter(
    (method) => method.amount > 0 || method.orders > 0
  );

  // If all payment methods have zero values, show all methods (default behavior)
  const methodsToDisplay =
    visiblePaymentMethods.length > 0 ? visiblePaymentMethods : paymentMethods;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-800">
              Total Collections Sources
            </h3>
            <InfoTooltip
              content="Breakdown of money collected by payment method (UPI, Cash, Card, Free orders, Credit orders, Advance payments) and total amount collected, excluding cancelled orders and pending credit"
            />
          </div>
          {hasTotal && (
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">
                Total: {formatCurrency(totalAmount)}
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="p-5 space-y-4">
        {methodsToDisplay.map((method, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {method.name}
              </span>
              <span className="text-sm">
                <span className="font-medium text-gray-900">
                  {formatCurrency(method.amount)}
                </span>{" "}
                <span className="text-gray-500">({method.orders} orders)</span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${method.color} h-2.5 rounded-full`}
                style={{
                  width: `${(method.amount / (totalAmount || 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Order Statistics Card Component
const OrderStatisticsCard = ({ orderStats }) => {
  // Use empty data if none provided
  const data = orderStats || {
    success_orders: 0,
    cancelled_orders: 0,
    complementary_orders: 0,
    KOT_orders: 0,
    udhari_orders: 0,
  };

  const orderTypes = [
    {
      name: "Success Order",
      count: data.success_orders || 0,
      color: "bg-green-100 text-green-800",
      icon: (
        <FontAwesomeIcon icon={faCheck} className="h-5 w-5 text-green-500 mt-8" />
      ),
    },
    {
      name: "Cancelled Order",
      count: data.cancelled_orders || 0,
      color: "bg-red-100 text-red-800",
      icon: (
        <FontAwesomeIcon icon={faXmark} className="h-5 w-5 text-red-500 mt-8" />
      ),
    },
    {
      name: "Complementary Order",
      count: data.complementary_orders || 0,
      color: "bg-purple-100 text-purple-800",
      icon: (
        <FontAwesomeIcon icon={faGift} className="h-5 w-5 text-purple-500 mt-8" />
      ),
    },
    {
      name: "Kitchen Order",
      count: data.KOT_orders || 0,
      color: "bg-yellow-100 text-yellow-800",
      icon: (
        <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-yellow-500 mt-8" />
      ),
    },
    {
      name: "Udhari Order",
      count: data.udhari_orders || 0,
      color: "bg-blue-100 text-blue-800",
      icon: (
        <FontAwesomeIcon icon={faCreditCard} className="h-5 w-5 text-blue-500 mt-8" />
      ),
    },
  ];

  // Filter out order types with count 0
  const visibleOrderTypes = orderTypes.filter((type) => type.count > 0);

  // If all counts are 0, show all cards (default behavior)
  const typesToDisplay =
    visibleOrderTypes.length > 0 ? visibleOrderTypes : orderTypes;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">Order Statistics</h3>
          <InfoTooltip
            content="Summary of order statuses including successful orders, cancelled orders, free orders, kitchen orders, and credit orders"
          />
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {typesToDisplay.map((type, index) => (
          <div
            key={index}
            className={`${type.color} rounded-lg p-4 flex items-center`}
          >
            <div className="flex-shrink-0 mr-3 flex items-center self-center">
              {type.icon}
            </div>
            <div>
              <span className="text-2xl font-bold block">{type.count}</span>
              <span className="text-sm">{type.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Order Type Stats Card Component
const OrderTypeStatsCard = ({ orderTypeData }) => {
  // Use empty data if none provided
  const data = orderTypeData || {
    "dine-in": 0,
    parcel: 0,
    delivery: 0,
    counter: 0,
    "drive-through": 0,
  };

  const orderTypes = [
    {
      name: "Dine In",
      count: data["dine-in"] || 0,
      color: "bg-purple-100 text-purple-800",
      icon: (
        <FontAwesomeIcon icon={faHome} className="h-5 w-5 text-purple-500 mt-8" />
      ),
    },
    {
      name: "Parcel",
      count: data["parcel"] || 0,
      color: "bg-green-100 text-green-800",
      icon: (
        <FontAwesomeIcon icon={faTruck} className="h-5 w-5 text-green-500 mt-8" />
      ),
    },
    {
      name: "Delivery",
      count: data["delivery"] || 0,
      color: "bg-blue-100 text-blue-800",
      icon: (
        <FontAwesomeIcon icon={faBolt} className="h-5 w-5 text-blue-500 mt-8" />
      ),
    },
    {
      name: "Counter",
      count: data["counter"] || 0,
      color: "bg-red-100 text-red-800",
      icon: (
        <FontAwesomeIcon icon={faCopy} className="h-5 w-5 text-red-500 mt-8" />
      ),
    },
    {
      name: "Drive Through",
      count: data["drive-through"] || 0,
      color: "bg-yellow-100 text-yellow-800",
      icon: (
        <FontAwesomeIcon icon={faArrowLeft} className="h-5 w-5 text-yellow-500 mt-8" />
      ),
    },
  ];

  // Filter out order types with count 0
  const visibleOrderTypes = orderTypes.filter((type) => type.count > 0);

  // If all counts are 0, show all cards (default behavior)
  const typesToDisplay =
    visibleOrderTypes.length > 0 ? visibleOrderTypes : orderTypes;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">
            Order Type Statistics
          </h3>
          <InfoTooltip
            content="Breakdown of orders by type (dine-in, parcel, delivery, counter, drive-through), excluding cancelled orders"
          />
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {typesToDisplay.map((type, index) => (
          <div
            key={index}
            className={`${type.color} rounded-lg p-4 flex items-center`}
          >
            <div className="flex-shrink-0 mr-3 flex items-center self-center">
              {type.icon}
            </div>
            <div>
              <span className="text-2xl font-bold block">{type.count}</span>
              <span className="text-sm">{type.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Weekly Order Stats Chart Component
const WeeklyOrderStatsChart = ({ weeklyData }) => {
  // Use empty data if none provided
  const data = weeklyData || {
    data: [
      ["Monday", "0"],
      ["Tuesday", "0"],
      ["Wednesday", "0"],
      ["Thursday", "0"],
      ["Friday", "0"],
      ["Saturday", "0"],
      ["Sunday", "0"],
    ],
    peak_day: ["None", "0"],
    low_day: ["None", "0"],
  };

  // Extract days and counts
  const allDays = data.data.map((day) => day[0]);
  const allCounts = data.data.map((day) => parseInt(day[1]));

  // Filter out days with zero counts
  const filteredData = data.data.filter((day) => parseInt(day[1]) > 0);
  const days = filteredData.map((day) => day[0]);
  const counts = filteredData.map((day) => parseInt(day[1]));

  // If all days have zero counts, use all days (default behavior)
  const daysToDisplay = days.length > 0 ? days : allDays;
  const countsToDisplay = counts.length > 0 ? counts : allCounts;

  const options = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      selection: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%", // Fixed column width for consistency
        endingShape: "rounded",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: daysToDisplay,
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
      tickPlacement: "on",
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Orders",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      followCursor: true,
      shared: true,
      intersect: false,
      fixed: { enabled: false },
      y: {
        formatter: function (val) {
          return val + " orders";
        },
      },
    },
    colors: [
      "#FF5733",
      "#FF8D1A",
      "#F4D03F",
      "#28A745",
      "#007BFF",
      "#4B0082",
      "#8E44AD",
    ],
    legend: {
      show: false,
    },
    annotations: {
      points: [],
    },
    grid: {
      padding: {
        left: 20,
        right: 20,
      },
    },
  };

  // Add peak day annotation if it's a valid day (not "None")
  if (
    data.peak_day &&
    data.peak_day[0] &&
    data.peak_day[0] !== "None" &&
    daysToDisplay.includes(data.peak_day[0])
  ) {
    options.annotations.points.push({
      x: data.peak_day[0],
      y: parseInt(data.peak_day[1]),
      marker: {
        size: 6,
        fillColor: "#FF4560",
        strokeColor: "#fff",
        strokeWidth: 2,
        radius: 2,
      },
      label: {
        borderColor: "#FF4560",
        offsetY: 0,
        style: {
          color: "#fff",
          background: "#FF4560",
          fontSize: "10px",
          fontWeight: "bold",
        },
        text: "Peak Day",
      },
    });
  }

  const series = [
    {
      name: "Orders",
      data: countsToDisplay,
    },
  ];

  // Find the peak day and low day
  const peakDay = data.peak_day || ["None", "0"];
  const lowDay = data.low_day || ["None", "0"];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">
            Weekly Order Statistics
          </h3>
          <InfoTooltip
            content="Order count for each day of the week with identification of busiest and quietest days"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {peakDay[0] !== "None" && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Peak: {peakDay[0]} - {peakDay[1]} orders
            </div>
          )}
          {lowDay[0] !== "None" && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Low: {lowDay[0]} - {lowDay[1]} orders
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

const ProductsAnalysisCard = ({ categoryData }) => {
  const [activeTab, setActiveTab] = useState("top");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // ✅ default 5 items

  // Sales performance data
  const salesData = categoryData || {
    top_selling: { items: [], pagination: {} },
    low_selling: { items: [], pagination: {} },
    no_selling: { items: [], pagination: {} },
  };

  // Set initial active tab
  useEffect(() => {
    if (salesData.top_selling?.items?.length > 0) {
      setActiveTab("top");
    } else if (salesData.low_selling?.items?.length > 0) {
      setActiveTab("low");
    } else if (salesData.no_selling?.items?.length > 0) {
      setActiveTab("no");
    }
  }, [salesData]);

  // Reset pagination & search on tab change
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
  }, [activeTab]);

  const topSellingItems = salesData.top_selling?.items || [];
  const lowSellingItems = salesData.low_selling?.items || [];
  const noSellingItems = salesData.no_selling?.items || [];

  const hasTopSellingData = topSellingItems.length > 0;
  const hasLowSellingData = lowSellingItems.length > 0;
  const hasNoSellingData = noSellingItems.length > 0;

  const getCurrentItems = () => {
    switch (activeTab) {
      case "top":
        return topSellingItems;
      case "low":
        return lowSellingItems;
      case "no":
        return noSellingItems;
      default:
        return [];
    }
  };

  const getFilteredItems = () => {
    const items = getCurrentItems();
    if (!searchQuery) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      (item.name || "").toLowerCase().includes(query)
    );
  };

  const filteredItems = getFilteredItems();
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Clamp current page if filter reduces items
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = filteredItems.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">Products Analysis</h3>
          <InfoTooltip
            content="Analysis of menu items showing top sellers, low sellers, items never sold, average prices, and price recommendations based on performance"
          />
        </div>

        <div className="mt-4 flex justify-center">
          <div
            className={`grid ${hasTopSellingData + hasLowSellingData + hasNoSellingData === 1
              ? "grid-cols-1"
              : hasTopSellingData + hasLowSellingData + hasNoSellingData === 2
                ? "grid-cols-2"
                : "grid-cols-3"
              } gap-4 w-full`}
          >
            {hasTopSellingData && (
              <button
                onClick={() => setActiveTab("top")}
                className={`px-10 py-3 text-sm font-medium rounded-md w-full ${activeTab === "top"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Top Selling
              </button>
            )}
            {hasLowSellingData && (
              <button
                onClick={() => setActiveTab("low")}
                className={`px-10 py-3 text-sm font-medium rounded-md w-full ${activeTab === "low"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Low Selling
              </button>
            )}
            {hasNoSellingData && (
              <button
                onClick={() => setActiveTab("no")}
                className={`px-10 py-3 text-sm font-medium rounded-md w-full ${activeTab === "no"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                No Selling
              </button>
            )}
            {!hasTopSellingData && !hasLowSellingData && !hasNoSellingData && (
              <button className="px-10 py-3 text-sm font-medium rounded-md bg-purple-600 text-white w-full">
                No Data Available
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search menu items..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              <FaXmark className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Menu Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Sales Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedItems.length > 0 ? (
              displayedItems.map((item, index) => (
                <tr key={item.item_id || index}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.name || "Unknown Item"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 text-right">
                    {item.sales_count}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No menu items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        {/* Items per page */}
        <div className="flex items-center">
          <span className="text-sm text-gray-700 m-1">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md text-sm p-2 pr-8 m-2"
          >
            {[5, 10, 20, 50, 100].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-700 ml-1 ">
          Showing {Math.min(startIndex + 1, totalItems || 0)} -{" "}
          {Math.min(endIndex, totalItems)} of {totalItems} records
        </div>

        {/* Page navigation (only when more than one page) */}
        {totalPages > 1 ? (
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded-md mr-1 text-sm"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2 py-1 border mx-1 text-sm rounded-md ${currentPage === i + 1
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-500 border-gray-300"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded-md ml-1 text-sm"
            >
              Next
            </button>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

// Legacy Products Analysis Card Component for backward compatibility
const ProductsAnalysisCardLegacy = ({ categoryData }) => {
  // Use empty data if none provided
  const defaultCategoryData = [
    {
      category_name: "Sample Category",
      total_orders: 0,
      top_menus: [
        { menu_name: "Sample Item 1", sales_count: 0 },
        { menu_name: "Sample Item 2", sales_count: 0 },
        { menu_name: "Sample Item 3", sales_count: 0 },
      ],
      no_selling: [
        { name: "Sample No-Sell Item 1", item_id: "sample1" },
        { name: "Sample No-Sell Item 2", item_id: "sample2" },
        { name: "Sample No-Sell Item 3", item_id: "sample3" },
      ],
    },
  ];

  // Use provided data or default data
  const data =
    categoryData && Array.isArray(categoryData) && categoryData.length > 0
      ? categoryData
      : defaultCategoryData;

  // First check if any category has a no_selling array with items
  const hasDirectNoSellingData = data.some(
    (category) =>
      category.no_selling &&
      Array.isArray(category.no_selling) &&
      category.no_selling.length > 0
  );

  // Get top selling items across all categories
  const topSellingItems = data
    .flatMap((category) =>
      category.top_menus.map((menu) => ({
        ...menu,
        category_name: category.category_name,
      }))
    )
    .filter((item) => item.sales_count > 0)
    .sort((a, b) => b.sales_count - a.sales_count)
    .slice(0, 5);

  // Get low selling items (items with sales count > 0, sorted ascending)
  const lowSellingItems = data
    .flatMap((category) =>
      category.top_menus.map((menu) => ({
        ...menu,
        category_name: category.category_name,
      }))
    )
    .filter((item) => item.sales_count > 0)
    .sort((a, b) => a.sales_count - b.sales_count)
    .slice(0, 5);

  // Get no selling items - first check if there's a dedicated no_selling array in the response
  const noSellingItemsFromDedicatedField = data.flatMap((category) =>
    category.no_selling && Array.isArray(category.no_selling)
      ? category.no_selling.map((item) => ({
        menu_name: item.name,
        sales_count: 0,
        category_name: category.category_name,
        item_id: item.item_id,
      }))
      : []
  );

  // If no dedicated field, fall back to filtering top_menus for sales_count === 0
  const noSellingItemsFromTopMenus = data.flatMap((category) =>
    category.top_menus
      .filter((menu) => menu.sales_count === 0)
      .map((menu) => ({
        ...menu,
        category_name: category.category_name,
      }))
  );

  // Use dedicated field if available, otherwise use filtered top_menus
  const noSellingItems =
    noSellingItemsFromDedicatedField.length > 0
      ? noSellingItemsFromDedicatedField.slice(0, 5)
      : noSellingItemsFromTopMenus.slice(0, 5);

  // Check which tabs have data
  const hasTopSellingData = topSellingItems.length > 0;
  const hasLowSellingData = lowSellingItems.length > 0;
  const hasNoSellingData = noSellingItems.length > 0;

  // If no data in any tab, use default data
  const useDefaultData =
    !hasTopSellingData && !hasLowSellingData && !hasNoSellingData;

  // Set initial active tab based on available data
  const [activeTab, setActiveTab] = useState(
    hasTopSellingData
      ? "top"
      : hasLowSellingData
        ? "low"
        : hasNoSellingData
          ? "no"
          : "top"
  );

  // Get the items to display based on active tab
  const getItemsToDisplay = () => {
    if (useDefaultData) {
      // Return default data if no real data is available
      return [
        {
          menu_name: "Butter Chicken",
          sales_count: 0,
          category_name: "Main Course",
        },
        {
          menu_name: "Paneer Tikka",
          sales_count: 0,
          category_name: "Starters",
        },
        {
          menu_name: "Masala Dosa",
          sales_count: 0,
          category_name: "Breakfast",
        },
        { menu_name: "Veg Biryani", sales_count: 0, category_name: "Rice" },
        {
          menu_name: "Chocolate Brownie",
          sales_count: 0,
          category_name: "Desserts",
        },
      ];
    }

    switch (activeTab) {
      case "top":
        return topSellingItems;
      case "low":
        return lowSellingItems;
      case "no":
        return noSellingItems;
      default:
        return topSellingItems.length > 0
          ? topSellingItems
          : lowSellingItems.length > 0
            ? lowSellingItems
            : noSellingItems.length > 0
              ? noSellingItems
              : [];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Products Analysis</h3>
        <div className="mt-4 flex justify-center">
          <div
            className={`grid ${hasTopSellingData + hasLowSellingData + hasNoSellingData === 1
              ? "grid-cols-1"
              : hasTopSellingData + hasLowSellingData + hasNoSellingData === 2
                ? "grid-cols-2"
                : hasTopSellingData + hasLowSellingData + hasNoSellingData === 3
                  ? "grid-cols-3"
                  : "grid-cols-1"
              } gap-4 w-full max-w-md`}
          >
            {hasTopSellingData && (
              <button
                onClick={() => setActiveTab("top")}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === "top"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Top Selling
              </button>
            )}
            {hasLowSellingData && (
              <button
                onClick={() => setActiveTab("low")}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === "low"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Low Selling
              </button>
            )}
            {hasNoSellingData && (
              <button
                onClick={() => setActiveTab("no")}
                className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === "no"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                No Selling
              </button>
            )}
            {useDefaultData && (
              <button className="px-6 py-3 text-sm font-medium rounded-md bg-purple-600 text-white">
                No Data Available
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Menu Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sales Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getItemsToDisplay().map((item, index) => {
              // For no_selling items from API, ensure we're displaying properly
              const isNoSellingItem = activeTab === "no";
              const displayName = isNoSellingItem
                ? item.menu_name || item.name || "Unknown Item"
                : item.menu_name;

              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {isNoSellingItem ? 0 : item.sales_count}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Add entries count footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        {/* Left section */}
        <div className="text-sm text-gray-700">
          {useDefaultData
            ? "Sample data"
            : `${activeTab === "top"
              ? "Top"
              : activeTab === "low"
                ? "Low"
                : "Non"
            } selling items`}
        </div>

        {/* Center section */}
        <div className="text-center text-sm text-gray-700">
          Showing {getItemsToDisplay().length} records
        </div>

        {/* Right section - empty to maintain layout */}
        <div className="invisible">Placeholder</div>
      </div>
    </div>
  );
};

// App Usage Stats Card Component
const AppUsageStatsChart = ({ appUsageData }) => {
  // Use empty data if none provided
  const data = appUsageData || {
    owner_app: 0,
    pos_app: 0,
    waiter_app: 0,
    captain_app: 0,
    user_app: 0,
    kds_app: 0,
    cds_app: 0,
  };

  // Create data array with app usage values
  const allAppData = [
    { name: "Owner App", value: Math.max(0, data.owner_app || 0) },
    { name: "POS App", value: Math.max(0, data.pos_app || 0) },
    { name: "Waiter App", value: Math.max(0, data.waiter_app || 0) },
    { name: "Captain App", value: Math.max(0, data.captain_app || 0) },
    { name: "Customer App", value: Math.max(0, data.user_app || 0) },
    { name: "KDS App", value: Math.max(0, data.kds_app || 0) },
    { name: "CDS App", value: Math.max(0, data.cds_app || 0) },
  ];

  // Filter out apps with zero usage
  const visibleApps = allAppData.filter((app) => app.value > 0);

  // If all apps have zero usage, show all apps (default behavior)
  const appData = visibleApps.length > 0 ? visibleApps : allAppData;

  const options = {
    chart: {
      type: "bar",
      height: 350, // Fixed height
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      selection: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "70%",
        distributed: true,
        dataLabels: {
          position: "front",
        },
        borderRadius: 2,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      textAnchor: "start",
      offsetX: 5,
      style: {
        fontSize: "12px",
        colors: ["#fff"],
        fontWeight: 500,
      },
      background: {
        enabled: false,
      },
    },
    colors: [
      "#8B5CF6",
      "#7C3AED",
      "#9333EA",
      "#A855F7",
      "#C084FC",
      "#D8B4FE",
      "#E9D5FF",
    ],
    xaxis: {
      categories: appData.map((d) => d.name),
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      followCursor: true,
      shared: true,
      intersect: false,
      fixed: { enabled: false },
      y: {
        formatter: function (val) {
          return val + " usages";
        },
      },
    },
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: "Usage",
      data: appData.map((d) => d.value),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">
          App Usage Statistics
        </h3>
      </div>
      <div className="p-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

// Category Performance Card Component
const CategoryPerformanceCard = ({ categoryData }) => {
  // Use empty data if none provided
  const data =
    categoryData && Array.isArray(categoryData) && categoryData.length > 0
      ? categoryData
      : [
        {
          category_name: "Sample Category",
          total_orders: 0,
          top_menus: [
            { menu_name: "Sample Item 1", sales_count: 0 },
            { menu_name: "Sample Item 2", sales_count: 0 },
            { menu_name: "Sample Item 3", sales_count: 0 },
          ],
        },
      ];

  // Sort categories by total orders
  const sortedCategoryData = [...data].sort(
    (a, b) => b.total_orders - a.total_orders
  );

  // Filter out categories with zero orders
  const visibleCategories = sortedCategoryData.filter(
    (category) => category.total_orders > 0
  );

  // If all categories have zero orders, show all categories (default behavior)
  const categoriesToDisplay =
    visibleCategories.length > 0 ? visibleCategories : sortedCategoryData;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">
            Category Performance
          </h3>
          <InfoTooltip
            content="Sales analysis by menu category showing total items sold, total earnings, and top performing items in each category"
          />
        </div>
        <p className="text-sm text-gray-500">
          {categoriesToDisplay.length} categories
        </p>
      </div>
      <div className="p-5">
        {categoriesToDisplay.map((category, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  {category.category_name}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  {category.top_menus.slice(0, 5).map((menu, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 whitespace-nowrap"
                    >
                      {menu.menu_name} ({menu.sales_count})
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-sm font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded">
                {category.total_orders} orders
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full"
                style={{
                  width: `${(category.total_orders /
                    (categoriesToDisplay[0].total_orders || 1)) *
                    100
                    }%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Combo Orders Card Component
const TopComboOrdersCard = ({ comboData }) => {
  // Use empty data if none provided
  const data =
    comboData && Array.isArray(comboData) && comboData.length > 0
      ? comboData
      : [
        {
          items: [{ name: "Sample Item 1" }, { name: "Sample Item 2" }],
          order_count: 0,
        },
        {
          items: [{ name: "Sample Item 3" }, { name: "Sample Item 4" }],
          order_count: 0,
        },
      ];

  // Filter out combos with zero orders
  const visibleCombos = data.filter((combo) => combo.order_count > 0);

  // If all combos have zero orders, show all combos (default behavior)
  const combosToDisplay = visibleCombos.length > 0 ? visibleCombos : data;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">Top Combo Orders</h3>
          <InfoTooltip
            content="Most popular combinations of items ordered together in the same order"
          />
        </div>
        <p className="text-sm text-gray-500">
          Most frequently ordered combinations
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Combo Items
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Order Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {combosToDisplay.map((combo, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {combo.items.map((item, idx) => (
                    <span key={idx}>
                      {item.name}
                      {idx < combo.items.length - 1 ? " + " : ""}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {combo.order_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Peak Time Analysis Chart Component
const PeakTimeAnalysisChart = ({ peakTimeData }) => {
  // Use empty data if none provided
  const data = peakTimeData || {
    breakfast: { order_count: 0, revenue: 0 },
    lunch: { order_count: 0, revenue: 0 },
    brunch: { order_count: 0, revenue: 0 },
    dinner: { order_count: 0, revenue: 0 },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Prepare data for the chart
  const mealPeriods = [
    { name: "Breakfast", key: "breakfast", color: "#FF6B6B" },
    { name: "Lunch", key: "lunch", color: "#4ECDC4" },
    { name: "Brunch", key: "brunch", color: "#45B7D1" },
    { name: "Dinner", key: "dinner", color: "#96CEB4" },
  ];

  // Filter out periods with zero orders
  const visiblePeriods = mealPeriods.filter(
    (period) => data[period.key].order_count > 0
  );

  // If all periods have zero orders, show all periods (default behavior)
  const periodsToDisplay =
    visiblePeriods.length > 0 ? visiblePeriods : mealPeriods;

  const options = {
    chart: {
      type: "bar",
      height: 350,
      fontFamily: "Inter, sans-serif",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      selection: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        endingShape: "rounded",
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      style: {
        fontSize: "12px",
        colors: ["#fff"],
        fontWeight: 500,
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: periodsToDisplay.map((period) => period.name),
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
        },
      },
      crosshairs: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Orders",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      followCursor: true,
      shared: true,
      intersect: false,
      fixed: { enabled: false },
      y: {
        formatter: function (val) {
          return val + " orders";
        },
      },
    },
    colors: periodsToDisplay.map((period) => period.color),
    legend: {
      show: false,
    },
    grid: {
      padding: {
        left: 20,
        right: 20,
      },
    },
  };

  const series = [
    {
      name: "Orders",
      data: periodsToDisplay.map((period) => data[period.key].order_count),
    },
  ];

  // Calculate total orders and revenue
  const totalOrders = periodsToDisplay.reduce(
    (sum, period) => sum + data[period.key].order_count,
    0
  );
  const totalRevenue = periodsToDisplay.reduce(
    (sum, period) => sum + data[period.key].revenue,
    0
  );

  // Find peak period
  const peakPeriod = periodsToDisplay.reduce(
    (peak, period) =>
      data[period.key].order_count > data[peak.key].order_count ? period : peak,
    periodsToDisplay[0]
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">
            Peak Time Analysis
          </h3>
          <InfoTooltip
            content="Order count and revenue by meal periods (Breakfast 6-11 AM, Lunch 11 AM-4 PM, Brunch 4-8 PM, Dinner 8 PM-12 AM), excluding cancelled, free, and unpaid credit orders"
          />
        </div>
        <p className="text-sm text-gray-500 mb-3">
          Order distribution by meal periods
        </p>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            <FontAwesomeIcon icon={faShoppingBag} className="h-4 w-4 mr-1" />
            Total: {totalOrders} orders
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            <FontAwesomeIcon icon={faRupeeSign} className="h-4 w-4 mr-1" />
            Revenue: {formatCurrency(totalRevenue)}
          </div>
          {peakPeriod && data[peakPeriod.key].order_count > 0 && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
              <FontAwesomeIcon icon={faBolt} className="h-4 w-4 mr-1" />
              Peak: {peakPeriod.name}
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </div>
    </div>
  );
};

// Enhanced Category Performance Card Component
const EnhancedCategoryPerformanceCard = ({ categoryData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Use empty data if none provided
  const data = categoryData || {
    summary: {
      total_categories: 0,
      total_category_earnings: 0,
      categories: [],
    },
    categories: [],
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Extract categories from the new structure
  const categories =
    data.categories && Array.isArray(data.categories) ? data.categories : [];
  const summary = data.summary || {
    total_categories: 0,
    total_category_earnings: 0,
  };

  // Sort categories by total earnings
  const sortedCategories = [...categories].sort(
    (a, b) => b.total_earnings - a.total_earnings
  );

  // Filter out categories with zero earnings
  const visibleCategories = sortedCategories.filter(
    (category) => category.total_earnings > 0
  );

  // If all categories have zero earnings, show all categories (default behavior)
  const categoriesToDisplay =
    visibleCategories.length > 0 ? visibleCategories : sortedCategories;

  // Calculate pagination
  const totalPages = Math.ceil(categoriesToDisplay.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categoriesToDisplay.slice(startIndex, endIndex);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoriesToDisplay.length]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-800">
              Category Performance
            </h3>
            <InfoTooltip
              content="CATEGORY WISE PERFORMANCE:
Total Orders: Total items sold in this category
Total Earnings: Total money earned from this category
Top Menus: Best-selling items in this category"
            />
            <p className="text-sm text-gray-500">
              {categoriesToDisplay.length} categories
            </p>
          </div>
          {summary.total_category_earnings > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(summary.total_category_earnings)}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        {currentCategories.length > 0 ? (
          <>
            {currentCategories.map((category, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      {category.category_name}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {category.total_orders} orders
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        {formatCurrency(category.total_earnings)}
                      </span>
                    </div>
                    {category.top_menus && category.top_menus.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                        {category.top_menus.slice(0, 5).map((menu, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 whitespace-nowrap"
                          >
                            {menu.menu_name} ({menu.sales_count})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{
                      width: `${(category.total_earnings /
                        (categoriesToDisplay[0]?.total_earnings || 1)) *
                        100
                        }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, categoriesToDisplay.length)} of{" "}
                  {categoriesToDisplay.length}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 002 2v6a2 2 0 002 2h2a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No category data available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Category performance data will appear here when available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Price Recommendation Card Component
const PriceRecommendationCard = ({ salesData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Debug logging for PriceRecommendationCard
  console.log("[PriceRecommendationCard] Received salesData:", {
    hasSalesData: !!salesData,
    salesDataKeys: salesData ? Object.keys(salesData) : [],
    topSellingItems: salesData?.top_selling?.items?.length || 0,
    lowSellingItems: salesData?.low_selling?.items?.length || 0,
    noSellingItems: salesData?.no_selling?.items?.length || 0,
  });

  // Use empty data if none provided
  const data = salesData || {
    statistics: {
      total_menus: 0,
      selling_menus_count: 0,
      no_selling_count: 0,
      top_selling_count: 0,
      low_selling_count: 0,
    },
    top_selling: { items: [], pagination: {} },
    low_selling: { items: [], pagination: {} },
    no_selling: { items: [], pagination: {} },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Extract items with price recommendations
  const topSellingItems = data.top_selling?.items || [];
  const lowSellingItems = data.low_selling?.items || [];
  const noSellingItems = data.no_selling?.items || [];

  // Combine all items with recommendations
  const allItemsWithRecommendations = [
    ...topSellingItems.map((item) => ({ ...item, type: "top" })),
    ...lowSellingItems.map((item) => ({ ...item, type: "low" })),
    ...noSellingItems.map((item) => ({ ...item, type: "no" })),
  ];

  // For no_selling items, recommendations are 0, which is expected
  // For top_selling and low_selling items, we should have recommendations
  const itemsToDisplay = allItemsWithRecommendations;

  // Calculate pagination
  const totalPages = Math.ceil(itemsToDisplay.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = itemsToDisplay.slice(startIndex, endIndex);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsToDisplay.length]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-gray-800">
              Price Recommendations
            </h3>
            <InfoTooltip
              content="Analysis of menu items showing top sellers, low sellers, items never sold, average prices, and price recommendations based on performance"
            />
          </div>
          {data.statistics && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Menu Analysis</p>
              <p className="text-xs text-gray-400">
                {data.statistics.selling_menus_count} selling,{" "}
                {data.statistics.no_selling_count} non-selling
              </p>
            </div>
          )}
        </div>
      </div>
      <div>
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
              >
                Menu Item
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Current Price
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
              >
                Recommended Price
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Sales Count
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
              >
                Type
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((item, index) => {
                const currentPrice = item.avg_price || 0;
                const recommendedPrice =
                  item.type === "top"
                    ? item.top_selling_recommended_price
                    : item.low_selling_recommended_price;
                const priceDifference = recommendedPrice - currentPrice;
                const priceChangePercent =
                  currentPrice > 0 ? (priceDifference / currentPrice) * 100 : 0;

                return (
                  <tr key={item.item_id || index}>
                    <td className="px-3 py-4 text-sm font-medium text-gray-900 break-words">
                      {item.name || "Unknown Item"}
                    </td>
                    <td className="px-2 py-4 text-sm text-gray-500 text-center">
                      {formatCurrency(currentPrice)}
                    </td>
                    <td className="px-2 py-4 text-sm text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(recommendedPrice)}
                        </span>
                        {priceDifference !== 0 && (
                          <span
                            className={`text-xs ${priceDifference > 0
                              ? "text-green-600"
                              : "text-red-600"
                              }`}
                          >
                            {priceDifference > 0 ? "+" : ""}
                            {formatCurrency(priceDifference)}(
                            {priceChangePercent > 0 ? "+" : ""}
                            {priceChangePercent.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4 text-sm text-gray-500 text-center">
                      {item.sales_count || 0}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.type === "top"
                          ? "bg-green-100 text-green-800"
                          : item.type === "low"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {item.type === "top"
                          ? "Top"
                          : item.type === "low"
                            ? "Low"
                            : "No Sales"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-10 w-10 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      No price recommendations available
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Price recommendations will appear here when available
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}-
              {Math.min(endIndex, itemsToDisplay.length)} of{" "}
              {itemsToDisplay.length}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Coupon Statistics Card Component
const CouponStatisticsCard = ({ couponData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Use empty data if none provided
  const data =
    couponData && Array.isArray(couponData) && couponData.length > 0
      ? couponData
      : [
        {
          coupon_id: 1,
          coupon_name: "SAMPLE001",
          used_count: 0,
          max_usage_limit: 50,
        },
      ];

  // Filter out coupons with zero usage
  const visibleCoupons = data.filter((coupon) => coupon.used_count > 0);

  // If all coupons have zero usage, show all coupons (default behavior)
  const couponsToDisplay = visibleCoupons.length > 0 ? visibleCoupons : data;

  // Sort by usage count (descending)
  const sortedCoupons = [...couponsToDisplay].sort(
    (a, b) => b.used_count - a.used_count
  );

  // Calculate total usage
  const totalUsage = sortedCoupons.reduce(
    (sum, coupon) => sum + coupon.used_count,
    0
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoupons = sortedCoupons.slice(startIndex, endIndex);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedCoupons.length]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">
            Coupon Statistics
          </h3>
          {totalUsage > 0 && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Usage</p>
              <p className="text-lg font-semibold text-purple-600">
                {totalUsage} redemptions
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                #
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Coupon Code
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Used Count
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Usage Limit
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCoupons.map((coupon, index) => {
              const limitUsagePercentage =
                coupon.max_usage_limit > 0
                  ? (coupon.used_count / coupon.max_usage_limit) * 100
                  : 0;

              return (
                <tr key={coupon.coupon_id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                      {coupon.coupon_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {coupon.used_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-gray-900">
                        {coupon.used_count}/{coupon.max_usage_limit}
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1 max-w-xs">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(limitUsagePercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {limitUsagePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedCoupons.length)}{" "}
            of {sortedCoupons.length}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Summary footer */}
      {totalUsage > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>Most Popular: {sortedCoupons[0]?.coupon_name}</span>
            <span>{sortedCoupons.length} active coupons</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Udhari Payment Stats Card Component
const UdhariPaymentStatsCard = ({ udhariData }) => {
  // Use empty data if none provided
  const udhariStats = udhariData || {
    udhari_pending: { amount: 0, count: 0 },
    udhari_paid: { amount: 0, count: 0 },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Check if Udhari section has any non-zero values
  const hasUdhariData =
    udhariStats.udhari_pending.amount > 0 ||
    udhariStats.udhari_pending.count > 0 ||
    udhariStats.udhari_paid.amount > 0 ||
    udhariStats.udhari_paid.count > 0;

  if (!hasUdhariData) return null;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">
            Udhari Payment Statistics
          </h3>
          <InfoTooltip
            content="Summary of credit orders showing pending amount and paid amount with counts"
          />
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {(udhariStats.udhari_pending.amount > 0 ||
            udhariStats.udhari_pending.count > 0) && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-700 mb-1">Pending</p>
                <p className="text-xl font-semibold text-amber-900">
                  {formatCurrency(udhariStats.udhari_pending.amount)}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {udhariStats.udhari_pending.count} transactions
                </p>
              </div>
            )}
          {(udhariStats.udhari_paid.amount > 0 ||
            udhariStats.udhari_paid.count > 0) && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Paid</p>
                <p className="text-xl font-semibold text-green-900">
                  {formatCurrency(udhariStats.udhari_paid.amount)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {udhariStats.udhari_paid.count} transactions
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Advance Payment Stats Card Component
const AdvancePaymentStatsCard = ({ advancePaymentData }) => {
  // Use empty data if none provided
  const advanceStats = advancePaymentData || {
    partial_payment: { amount: 0, count: 0 },
    settled_payment: { amount: 0, count: 0 },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Check if Advance Payment section has any non-zero values
  const hasAdvanceData =
    advanceStats.partial_payment.amount > 0 ||
    advanceStats.partial_payment.count > 0 ||
    advanceStats.settled_payment.amount > 0 ||
    advanceStats.settled_payment.count > 0;

  if (!hasAdvanceData) return null;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-800">
            Advance Payment Statistics
          </h3>
          <InfoTooltip
            content="Summary of advance/booking payments showing partial payments received and settled/completed bookings with amounts"
          />
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4">
          {(advanceStats.partial_payment.amount > 0 ||
            advanceStats.partial_payment.count > 0) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Partial Payment</p>
                <p className="text-xl font-semibold text-blue-900">
                  {formatCurrency(advanceStats.partial_payment.amount)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {advanceStats.partial_payment.count} transactions
                </p>
              </div>
            )}
          {(advanceStats.settled_payment.amount > 0 ||
            advanceStats.settled_payment.count > 0) && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Settled Payment</p>
                <p className="text-xl font-semibold text-purple-900">
                  {formatCurrency(advanceStats.settled_payment.amount)}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {advanceStats.settled_payment.count} transactions
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default function Statistics() {
  const outletId = useOutletId();
  const { warningElement } = useOutletWarning();
  const fetchedForOutletRef = useRef(null);
  const navigate = useNavigate();
  const [currentDateRange, setCurrentDateRange] = useState(() => {
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
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  // Use the statistics hook
  const {
    data: statistics,
    isLoading,
    error,
    refresh,
    updateDateRange,
  } = useStatistics(
    {
      outlet_id: outletId,
      ...(currentDateRange.type !== "all" &&
        (() => {
          // For custom date range, use the provided dates
          if (
            currentDateRange.type === "custom" &&
            currentDateRange.startDate &&
            currentDateRange.endDate
          ) {
            return {
              start_date: formatDateForAPI(
                new Date(currentDateRange.startDate)
              ),
              end_date: formatDateForAPI(new Date(currentDateRange.endDate)),
            };
          }
          // For predefined date ranges (today, yesterday, etc.), calculate the dates
          else {
            const { startDate, endDate } = getDateRangeFromType(
              currentDateRange.type
            );
            return {
              start_date: startDate,
              end_date: endDate,
            };
          }
        })()),
    },
    {
      // Additional options if needed
      enabled: !!outletId,
    }
  );

  // Notify about loading state changes only during manual refresh
  useEffect(() => {
    let hasNotified = false; // Track if notification has been shown for this refresh

    if (isManualRefresh) {
      if (isLoading && !hasNotified) {
        console.log("Statistics data loading started (manual refresh)");
        window.dispatchEvent(new CustomEvent("statistics:loading:start"));
        hasNotified = true; // Mark as notified
      } else if (!isLoading && hasNotified) {
        console.log("Statistics data loading ended (manual refresh)");
        window.dispatchEvent(new CustomEvent("statistics:loading:end"));
        setIsManualRefresh(false); // Reset manual refresh
        hasNotified = false; // Reset notification flag
        // Optionally dispatch an event to explicitly clear the notification
        window.dispatchEvent(new CustomEvent("statistics:notification:clear"));
      }
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (hasNotified) {
        window.dispatchEvent(new CustomEvent("statistics:notification:clear"));
      }
    };
  }, [isLoading, isManualRefresh]);

  // Apply persisted date range on component mount
  useEffect(() => {
    // If we have a persisted date range that's not 'today', apply it
    if (currentDateRange.type !== "today" && outletId) {
      console.log("Applying persisted date range on mount:", currentDateRange);

      if (
        currentDateRange.type === "custom" &&
        currentDateRange.startDate &&
        currentDateRange.endDate
      ) {
        // For custom date range
        updateDateRange(
          formatDateForAPI(new Date(currentDateRange.startDate)),
          formatDateForAPI(new Date(currentDateRange.endDate))
        );
      } else if (currentDateRange.type !== "all") {
        // For predefined date ranges (today, yesterday, etc.)
        const { startDate, endDate } = getDateRangeFromType(
          currentDateRange.type
        );
        updateDateRange(startDate, endDate);
      } else {
        // For 'all' time range, refresh without date parameters
        refresh();
      }
    }
  }, [outletId]); // Only run when outletId is available

  // Handle date range changes
  useEffect(() => {
    const handleDateRangeChange = (event) => {
      const range = event.detail;
      setCurrentDateRange(range);
      setIsManualRefresh(true);

      // Refresh data with new date range
      if (range.type === "custom" && range.startDate && range.endDate) {
        // For custom date range
        updateDateRange(
          formatDateForAPI(new Date(range.startDate)),
          formatDateForAPI(new Date(range.endDate))
        );
      } else if (range.type !== "all") {
        // For predefined date ranges (today, yesterday, etc.)
        const { startDate, endDate } = getDateRangeFromType(range.type);
        updateDateRange(startDate, endDate);
      } else {
        // For 'all' time range, refresh without date parameters
        refresh();
      }
    };

    window.addEventListener("daterange:changed", handleDateRangeChange);
    return () => {
      window.removeEventListener("daterange:changed", handleDateRangeChange);
    };
  }, [updateDateRange, refresh]);

  // Listen for manual refresh requests
  useEffect(() => {
    const handleRefreshRequest = () => {
      console.log("Manual refresh requested");
      setIsManualRefresh(true);
    };

    window.addEventListener("refresh:requested", handleRefreshRequest);
    return () => {
      window.removeEventListener("refresh:requested", handleRefreshRequest);
    };
  }, []);

  // Add debugging logs for component lifecycle and render
  useEffect(() => {
    console.log("[Statistics] Component mounted");

    return () => {
      console.log("[Statistics] Component unmounted");
    };
  }, []);

  // Debug current data state
  useEffect(() => {
    console.log("[Statistics] Data state update:", {
      hasData: !!statistics,
      outletId: statistics?.outlet_id,
      currentContextOutletId: outletId,
      fetchedForOutlet: fetchedForOutletRef.current,
      isLoading,
      isManualRefresh,
    });
  }, [statistics, outletId, isLoading, isManualRefresh]);

  // Handle offline mode errors
  useEffect(() => {
    if (error) {
      // Check if the error is related to offline mode
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.response?.data?.data?.detail || error?.message || "";

      if (
        errorMessage.includes("offline mode") ||
        errorMessage.includes("This operation is not allowed in offline mode")
      ) {
        // Dispatch custom event for offline mode modal
        window.dispatchEvent(
          new CustomEvent("offline:error", {
            detail: { error },
          })
        );
      }
    }
  }, [error]);

  // Breadcrumb items

  const breadcrumbItems = [{ text: "Home", url: "/" }, { text: "Statistics" }];

  // Format currency in Indian format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format turnover time
  const formatTurnoverTime = (timeStr) => {
    if (!timeStr) return "0 min";

    // Extract minutes and seconds if in format "X min Y sec"
    const minutesSecondsMatch = timeStr.match(
      /(\d+)\s*hr(?:\s*(\d+)\s*min)?(?:\s*(\d+)\s*sec)?/
    );
    if (minutesSecondsMatch) {
      const hours = parseInt(minutesSecondsMatch[1], 10) || 0;
      const minutes = parseInt(minutesSecondsMatch[2], 10) || 0;

      if (hours > 0) {
        return `${hours}h ${minutes > 0 ? minutes + "m" : ""}`;
      }
      return `${minutes}m`;
    }

    return timeStr;
  };

  // Check if we have analytics data - always show during loading
  const hasAnalytics =
    isLoading ||
    (statistics &&
      statistics.analytic_reports &&
      (statistics.analytic_reports.total_orders > 0 ||
        statistics.analytic_reports.total_revenue > 0));
  const hasOrderTypeData =
    isLoading ||
    (statistics &&
      statistics.order_type_statistics &&
      Object.values(statistics.order_type_statistics).some((val) => val > 0));
  const hasFoodTypeData =
    isLoading ||
    (statistics &&
      statistics.food_type_statistics &&
      Object.keys(statistics.food_type_statistics).some((day) =>
        Object.values(statistics.food_type_statistics[day]).some(
          (val) => val > 0
        )
      ));
  const hasOrderStatistics =
    isLoading ||
    (statistics &&
      statistics.order_statistics &&
      Object.values(statistics.order_statistics).some((val) => val > 0));
  const hasWeeklyOrderStats =
    isLoading ||
    (statistics &&
      statistics.weekly_order_stats &&
      statistics.weekly_order_stats.data &&
      statistics.weekly_order_stats.data.some((day) => parseInt(day[1]) > 0));
  const hasCollectionSource =
    isLoading ||
    (statistics &&
      statistics.total_collection_source &&
      (statistics.total_collection_source.upi_amount > 0 ||
        statistics.total_collection_source.cash_amount > 0 ||
        statistics.total_collection_source.card_amount > 0 ||
        statistics.total_collection_source.complementary_amount > 0 ||
        statistics.total_collection_source.udhari_amount > 0 ||
        statistics.total_collection_source.advance_payment_amount > 0));
  const hasAppUsage =
    isLoading ||
    (statistics &&
      statistics.app_usage_statistics &&
      Object.values(statistics.app_usage_statistics).some((val) => val > 0));
  const hasCategoryPerformance =
    isLoading ||
    (statistics &&
      statistics.category_wise_performance &&
      Array.isArray(statistics.category_wise_performance) &&
      statistics.category_wise_performance.length > 0);
  const hasMenuCombos =
    isLoading ||
    (statistics &&
      statistics.menu_combos &&
      Array.isArray(statistics.menu_combos) &&
      statistics.menu_combos.length > 0);
  const hasCouponStats =
    isLoading ||
    (statistics &&
      statistics.coupon_statistics &&
      Array.isArray(statistics.coupon_statistics) &&
      statistics.coupon_statistics.length > 0);
  const hasUdhariCard =
    isLoading ||
    (statistics &&
      statistics.udhari_card &&
      (statistics.udhari_card.udhari_pending.count > 0 ||
        statistics.udhari_card.udhari_paid.count > 0));
  const hasAdvancePayment =
    isLoading ||
    (statistics &&
      statistics.advance_payment_card &&
      (statistics.advance_payment_card.partial_payment.count > 0 ||
        statistics.advance_payment_card.settled_payment.count > 0));
  const hasPeakTimeAnalysis =
    isLoading ||
    (statistics &&
      statistics.peak_time_analysis &&
      Object.values(statistics.peak_time_analysis).some(
        (period) => period.order_count > 0
      ));
  const hasEnhancedCategoryPerformance =
    isLoading ||
    (statistics &&
      statistics.category_wise_performance &&
      statistics.category_wise_performance.categories &&
      Array.isArray(statistics.category_wise_performance.categories) &&
      statistics.category_wise_performance.categories.length > 0);
  const hasPriceRecommendations =
    isLoading ||
    (statistics &&
      statistics.sales_performance &&
      (statistics.sales_performance.top_selling?.items?.length > 0 ||
        statistics.sales_performance.low_selling?.items?.length > 0 ||
        statistics.sales_performance.no_selling?.items?.length > 0));

  // Handle case where no data is available yet
  const hasAnyData =
    isLoading ||
    (statistics &&
      Object.keys(statistics).length > 0 &&
      (hasAnalytics ||
        hasOrderTypeData ||
        hasFoodTypeData ||
        hasOrderStatistics ||
        hasWeeklyOrderStats ||
        hasCollectionSource ||
        hasAppUsage ||
        hasCategoryPerformance ||
        hasMenuCombos ||
        hasUdhariCard ||
        hasAdvancePayment ||
        hasPeakTimeAnalysis ||
        hasEnhancedCategoryPerformance ||
        hasPriceRecommendations ||
        hasCouponStats));

  // If no outlet is selected, show warning
  if (!outletId) {
    return (
      <div className="space-y-4 p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Statistics Dashboard
          </h1>
        </div>
        {warningElement}
      </div>
    );
  }

  // Get formatted date range for display
  const getActiveDateRangeText = () => {
    if (!currentDateRange || currentDateRange.type === "all") return null;

    switch (currentDateRange.type) {
      case "custom":
        if (currentDateRange.startDate && currentDateRange.endDate) {
          const formatDate = (dateStr) => {
            const date = new Date(dateStr);
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
            return `${date.getDate()} ${months[date.getMonth()]
              } ${date.getFullYear()}`;
          };
          return `${formatDate(currentDateRange.startDate)} to ${formatDate(
            currentDateRange.endDate
          )}`;
        }
        return null;
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "last7days":
        return "Last 7 Days";
      case "last30days":
        return "Last 30 Days";
      case "thisMonth":
        return "This Month";
      case "lastMonth":
        return "Last Month";
      default:
        return null;
    }
  };

  const activeDateRangeText = getActiveDateRangeText();

  // Create empty data structures for components during loading
  const emptyData = {
    analytic_reports: {
      total_orders: 0,
      total_revenue: 0,
      avg_order_value: 0,
      average_turnover_time: "0 min",
    },
    order_type_statistics: {
      "dine-in": 0,
      parcel: 0,
      delivery: 0,
      counter: 0,
      "drive-through": 0,
    },
    food_type_statistics: {
      monday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
      tuesday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
      wednesday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
      thursday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
      friday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
      saturday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
      sunday: { veg: 0, nonveg: 0, vegan: 0, egg: 0 },
    },
    order_statistics: {
      success_orders: 0,
      cancelled_orders: 0,
      complementary_orders: 0,
      KOT_orders: 0,
      udhari_orders: 0,
    },
    weekly_order_stats: {
      data: [
        ["Monday", "0"],
        ["Tuesday", "0"],
        ["Wednesday", "0"],
        ["Thursday", "0"],
        ["Friday", "0"],
        ["Saturday", "0"],
        ["Sunday", "0"],
      ],
      peak_day: ["None", "0"],
      low_day: ["None", "0"],
    },
    total_collection_source: {
      upi_amount: 0,
      cash_amount: 0,
      card_amount: 0,
      complementary_amount: 0,
      udhari_amount: 0,
      advance_payment_amount: 0,
      upi_orders: 0,
      cash_orders: 0,
      card_orders: 0,
      complementary_orders: 0,
      udhari_orders: 0,
      advance_payment_orders: 0,
      total_amount: 0,
    },
    app_usage_statistics: {
      owner_app: 0,
      pos_app: 0,
      waiter_app: 0,
      captain_app: 0,
      user_app: 0,
      kds_app: 0,
      cds_app: 0,
    },
    category_wise_performance: {
      summary: {
        total_categories: 0,
        total_category_earnings: 0,
        categories: [],
      },
      categories: [],
    },
    menu_combos: [],
    udhari_card: {
      udhari_pending: { amount: 0, count: 0 },
      udhari_paid: { amount: 0, count: 0 },
    },
    advance_payment_card: {
      partial_payment: { amount: 0, count: 0 },
      settled_payment: { amount: 0, count: 0 },
    },
    peak_time_analysis: {
      breakfast: { order_count: 0, revenue: 0 },
      lunch: { order_count: 0, revenue: 0 },
      brunch: { order_count: 0, revenue: 0 },
      dinner: { order_count: 0, revenue: 0 },
    },
    sales_performance: {
      statistics: {
        total_menus: 0,
        selling_menus_count: 0,
        no_selling_count: 0,
        top_selling_count: 0,
        low_selling_count: 0,
      },
      top_selling: { items: [], pagination: {} },
      low_selling: { items: [], pagination: {} },
      no_selling: { items: [], pagination: {} },
    },
    coupon_statistics: [],
  };

  // Use actual data if available, otherwise use empty data during loading
  const displayData = isLoading ? emptyData : statistics || emptyData;

  // Apply initial date filter when component mounts
  useEffect(() => {
    if (outletId && currentDateRange.type !== "all") {
      console.log("Applying initial date filter:", currentDateRange.type);

      // For custom date range
      if (
        currentDateRange.type === "custom" &&
        currentDateRange.startDate &&
        currentDateRange.endDate
      ) {
        updateDateRange(
          formatDateForAPI(new Date(currentDateRange.startDate)),
          formatDateForAPI(new Date(currentDateRange.endDate))
        );
      }
      // For predefined date ranges (today, yesterday, etc.)
      else {
        const { startDate, endDate } = getDateRangeFromType(
          currentDateRange.type
        );
        console.log("Initial date range:", { startDate, endDate });
        updateDateRange(startDate, endDate);
      }
    }
  }, [outletId, currentDateRange.type]);

  return (
    <div className="space-y-4 p-2 sm:p-3">
      <div>
        <SubscriptionRemainDay />
      </div>
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-6 h-6 text-gray-500" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Statistics Dashboard
          </h1>
          {isLoading && (
            <div className="ml-3 flex items-center">
              <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></div>
              <div
                className="animate-pulse h-2 w-2 bg-blue-600 rounded-full mx-1"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
          )}
        </div>

        {activeDateRangeText && (
          <div className="mt-2 sm:mt-0 flex items-center">
            <span className="inline-flex items-center px-4 py-2 rounded-md bg-primary-50 text-primary-800 border border-primary-200 shadow-sm">
              <FontAwesomeIcon icon={faCalendarDays} className="h-5 w-5 mr-2 text-primary-500" />
              <span className="font-medium">
                Filtered by: {activeDateRangeText}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Show error message if there was an error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faCircleXmark} className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {typeof error === "string"
                  ? error
                  : error?.response?.data?.data?.detail ||
                  error?.message ||
                  "An error occurred while fetching statistics"}
                .
                <button
                  className="ml-2 font-medium underline"
                  onClick={() => fetchStatistics({ outlet_id: outletId }, true)}
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Always render all components, they will handle empty states internally */}
      <>
        {/* Summary Cards - Always show all cards during loading, otherwise only show non-zero values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(isLoading || displayData?.analytic_reports?.total_orders > 0) && (
            <SummaryCard
              value={displayData.analytic_reports.total_orders}
              title="Total Orders"
              icon="orders"
              tooltipContent="Count of all non-cancelled orders placed"
            />
          )}
          {(isLoading || displayData?.analytic_reports?.total_revenue > 0) && (
            <SummaryCard
              value={formatCurrency(displayData.analytic_reports.total_revenue)}
              title="Total Revenue"
              icon="revenue"
              tooltipContent="Sum of money from paid orders excluding cancelled, free, and unpaid credit orders"
            />
          )}
          {(isLoading ||
            displayData?.analytic_reports?.avg_order_value > 0) && (
              <SummaryCard
                value={formatCurrency(
                  displayData.analytic_reports.avg_order_value
                )}
                title="Avg. Order Value"
                icon="average"
                tooltipContent="Average bill amount per order (total bill ÷ total orders)"
              />
            )}
          {(isLoading ||
            (displayData?.analytic_reports?.average_turnover_time &&
              displayData?.analytic_reports?.average_turnover_time !==
              "0 min")) && (
              <SummaryCard
                value={formatTurnoverTime(
                  displayData.analytic_reports.average_turnover_time
                )}
                title="Avg. Turnover Time"
                icon="time"
                tooltipContent="Average time from when order is placed to when it's paid"
              />
            )}
        </div>

        {/* Collection Sources and Order Statistics - Only render grid if at least one component has data */}
        {(hasCollectionSource || hasOrderStatistics) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasCollectionSource && (
              <CollectionSourcesCard
                collectionData={displayData.total_collection_source}
              />
            )}
            {hasOrderStatistics && (
              <OrderStatisticsCard orderStats={displayData.order_statistics} />
            )}
          </div>
        )}

        {/* Order Type and Food Type Charts - Only render grid if at least one component has data */}
        {(hasOrderTypeData || hasFoodTypeData) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasOrderTypeData && (
              <OrderTypeStatsCard
                orderTypeData={displayData.order_type_statistics}
              />
            )}
            {hasFoodTypeData && (
              <FoodTypeChart foodTypeData={displayData.food_type_statistics} />
            )}
          </div>
        )}

        {/* Products Analysis and Weekly Order Stats - Only render grid if at least one component has data */}
        {(hasPriceRecommendations || hasWeeklyOrderStats) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasPriceRecommendations && (
              <ProductsAnalysisCard
                categoryData={displayData.sales_performance}
              />
            )}
            {hasWeeklyOrderStats && (
              <WeeklyOrderStatsChart
                weeklyData={displayData.weekly_order_stats}
              />
            )}
          </div>
        )}

        {/* Peak Time Analysis and Enhanced Category Performance - Only render grid if at least one component has data */}
        {(hasPeakTimeAnalysis || hasEnhancedCategoryPerformance) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasPeakTimeAnalysis && (
              <PeakTimeAnalysisChart
                peakTimeData={displayData.peak_time_analysis}
              />
            )}
            {hasEnhancedCategoryPerformance && (
              <EnhancedCategoryPerformanceCard
                categoryData={displayData.category_wise_performance}
              />
            )}
          </div>
        )}

        {/* App Usage Chart - Only render if it has data */}
        {/* {hasAppUsage && (
        <div className="grid grid-cols-1 gap-6">
            <AppUsageStatsChart appUsageData={displayData.app_usage_statistics} />
        </div>
        )} */}

        {/* Category Performance and Top Combo Orders - Only render grid if at least one component has data */}
        {(hasCategoryPerformance || hasMenuCombos) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasCategoryPerformance && (
              <CategoryPerformanceCard
                categoryData={displayData.category_wise_performance}
              />
            )}
            {hasMenuCombos && (
              <TopComboOrdersCard comboData={displayData.menu_combos} />
            )}
          </div>
        )}

        {/* Price Recommendations and Coupon Statistics - Only render grid if at least one component has data */}
        {(hasPriceRecommendations || hasCouponStats) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasPriceRecommendations && (
              <PriceRecommendationCard
                salesData={displayData.sales_performance}
              />
            )}
            {hasCouponStats && (
              <CouponStatisticsCard
                couponData={displayData.coupon_statistics}
              />
            )}
          </div>
        )}

        {/* Payment Statistics - Only render if it has data */}
        {(hasUdhariCard || hasAdvancePayment) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hasUdhariCard && (
              <UdhariPaymentStatsCard udhariData={displayData?.udhari_card} />
            )}
            {hasAdvancePayment && (
              <AdvancePaymentStatsCard
                advancePaymentData={displayData?.advance_payment_card}
              />
            )}
          </div>
        )}

        {/* Show message if no data available for any section */}
        {!hasAnyData && (
          <div className="mt-8 text-center p-10 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No statistics data available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There is no data available for the selected outlet or time period.
            </p>
          </div>
        )}
      </>
    </div>
  );
}

const SummaryCard = ({ title, value, icon, tooltipContent }) => {
  const getIconComponent = () => {
    switch (icon) {
      case "orders":
        return (
          <FontAwesomeIcon icon={faShoppingBag} className="h-8 w-8 text-blue-500" />
        );
      case "revenue":
        return (
          <FontAwesomeIcon icon={faRupeeSign} className="h-8 w-8 text-green-500" />
        );
      case "average":
        return (
          <FontAwesomeIcon icon={faCalculator} className="h-8 w-8 text-purple-500" />
        );
      case "time":
        return (
          <FontAwesomeIcon icon={faClock} className="h-8 w-8 text-orange-500" />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{getIconComponent()}</div>
          <div className="ml-5 w-0 flex-1 flex-1">
            <dl>
              <dd>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-medium text-gray-900">{value}</div>
                  {tooltipContent && (
                    <InfoTooltip content={tooltipContent} className="ml-1" preferredPosition="bottom" />
                  )}
                </div>
              </dd>
              <dt className="text-sm font-medium text-gray-500 truncate mt-1">
                {title}
              </dt>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
