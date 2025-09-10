import { useState, useEffect } from "react";
import { ReportTable } from "../../components/common";
import { Breadcrumb } from "../../components";
import { getSpecialDiscountReport } from "../../api/reports";
import { formatInputDateForAPI, getDateRangeFromType } from "../../utils/dateUtils";
import { useOutlet } from "../../context/OutletContext"; // Assuming this context exists

export default function SpecialDiscountReports() {
  const { currentOutlet } = useOutlet(); // Assuming this provides the current outlet
  const [filterParams, setFilterParams] = useState({
    filter_type: "all",
    outlet_id: currentOutlet?.outlet_id || null, // Add outlet_id if required by API
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateFilterType, setDateFilterType] = useState("all");

  // Function to format snake_case to Title Case
  const formatOrderStatus = (status) => {
    if (!status) return "-";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Define columns for the special discount report
  const columns = [
    {
      header: "Order Number",
      accessor: "order_number",
      Cell: (row) => (
        <div className="font-medium text-gray-900">#{row.order_number || "N/A"}</div>
      ),
    },
    {
      header: "Customer",
      accessor: "customer_name",
      Cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customer_name || "N/A"}</div>
          {row.customer_mobile && (
            <div className="text-xs text-gray-500">{row.customer_mobile}</div>
          )}
        </div>
      ),
    },
    {
      header: "Order Type",
      accessor: "order_type",
      Cell: (row) => (
        <div className="capitalize">{row.order_type || "N/A"}</div>
      ),
    },
    {
      header: "Status",
      accessor: "order_status",
      Cell: (row) => (
        <div className="text-sm capitalize text-gray-700">
          {formatOrderStatus(row.order_status)}
        </div>
      ),
    },
    {
      header: "Payment Method",
      accessor: "payment_method",
      Cell: (row) => (
        <div className="capitalize">{row.payment_method || "N/A"}</div>
      ),
    },
    {
      header: "Created On",
      accessor: "created_on",
      Cell: (row) => (
        <div className="text-sm text-gray-500">{row.created_on || "N/A"}</div>
      ),
    },
    {
      header: "Bill Amount",
      accessor: "total_bill_amount",
      Cell: (row) => (
        <div className="text-sm text-gray-500">
          ₹{row.total_bill_amount?.toFixed(2) || "0.00"}
        </div>
      ),
    },
    {
      header: "Special Discount",
      accessor: "special_discount_amount",
      Cell: (row) => (
        <div className="font-medium text-red-600">
          ₹{row.special_discount_amount?.toFixed(2) || "0.00"}
        </div>
      ),
    },
    {
      header: "Final Amount",
      accessor: "final_grand_total",
      Cell: (row) => (
        <div className="font-medium text-gray-900">
          ₹{row.final_grand_total?.toFixed(2) || "0.00"}
        </div>
      ),
    },
  ];

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    const { value } = e.target;
    setDateFilterType(value);

    const newParams = { ...filterParams, filter_type: value, outlet_id: currentOutlet?.outlet_id || filterParams.outlet_id };

    if (value === "all") {
      delete newParams.start_date;
      delete newParams.end_date;
    } else if (value === "custom") {
      if (startDate && endDate) {
        newParams.filter_type = "date_range";
        newParams.start_date = formatInputDateForAPI(startDate);
        newParams.end_date = formatInputDateForAPI(endDate);
      } else {
        // Do not update params if dates are incomplete
        return;
      }
    } else {
      const { startDate: calculatedStart, endDate: calculatedEnd } = getDateRangeFromType(value);
      if (calculatedStart && calculatedEnd) {
        setStartDate(calculatedStart); // Store in input format (DD MMM YYYY)
        setEndDate(calculatedEnd);
        newParams.filter_type = "date_range";
        newParams.start_date = calculatedStart; // API expects DD MMM YYYY
        newParams.end_date = calculatedEnd;
      }
    }

    setFilterParams(newParams);
    console.log("Filter Params sent to API:", newParams); // Debug log
  };

  // Handle date input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    }

    if (dateFilterType === "custom" && startDate && endDate) {
      const newParams = { ...filterParams, filter_type: "date_range" };
      newParams.start_date = formatInputDateForAPI(startDate);
      newParams.end_date = formatInputDateForAPI(endDate);
      setFilterParams(newParams);
      console.log("Custom Date Params:", newParams); // Debug log
    }
  };

  // Handle order type filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "order_type") {
      const newParams = { ...filterParams };

      if (value === "all") {
        delete newParams.order_type;
      } else {
        newParams.order_type = value;
      }

      setFilterParams(newParams);
      console.log("Order Type Params:", newParams); // Debug log
    }
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={dateFilterType}
          onChange={handleDateFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>

        {dateFilterType === "custom" && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleDateChange}
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Start Date"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              name="endDate"
              value={endDate}
              min={startDate}
              onChange={handleDateChange}
              className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="End Date"
            />
          </div>
        )}
      </div>

      <div>
        <select
          name="order_type"
          value={filterParams.order_type || "all"}
          onChange={handleFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Order Types</option>
          <option value="dine-in">Dine In</option>
          <option value="parcel">Parcel</option>
          <option value="counter">Counter</option>
          <option value="delivery">Delivery</option>
          <option value="drive-through">Drive Through</option>
        </select>
      </div>
    </div>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { text: "Home", url: "/" },
    { text: "Reports", url: "/reports" },
    { text: "Special Discount Reports" },
  ];

  // Test API call manually to debug
  useEffect(() => {
    const testParams = {
      filter_type: "date_range",
      outlet_id: currentOutlet?.outlet_id || "1", // Replace "1" with a valid outlet_id
      start_date: "01 Sep 2025",
      end_date: "01 Sep 2025", // Today's date as per system time
    };
    getSpecialDiscountReport(testParams).then((response) => {
      console.log("Test API Response:", response); // Log the response
    }).catch((error) => {
      console.error("Test API Error:", error); // Log any errors
    });
  }, [currentOutlet]);

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <ReportTable
        title="Special Discount Reports"
        columns={columns}
        apiCallback={getSpecialDiscountReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: "created_on", direction: "desc" }}
      />
    </div>
  );
}