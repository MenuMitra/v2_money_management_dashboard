import { useState, useEffect, useRef } from "react";
import { CSVLink } from "react-csv";
import { utils, write } from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const RECORDS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100];

const ReportTable = ({
  title,
  columns,
  apiCallback,
  filterParams = {},
  filterComponent,
  initialSortConfig = { key: null, direction: null },
  onDataLoaded,
  generateDisabled = false,
  generateDisabledMessage = "",
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [visibleRecords, setVisibleRecords] = useState(
    RECORDS_PER_PAGE_OPTIONS[10]
  );
  const [recordsPerPage, setRecordsPerPage] = useState(
    RECORDS_PER_PAGE_OPTIONS[0]
  );
  const [sortConfig, setSortConfig] = useState(initialSortConfig);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [selectedRows, setSelectedRows] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [columnSearchQueries, setColumnSearchQueries] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Initialize column selection state
  useEffect(() => {
    if (columns && columns.length > 0) {
      const initialColumnState = {};
      columns.forEach((column) => {
        // By default, include all columns except those marked as excludeFromExport
        initialColumnState[column.accessor] = !column.excludeFromExport;
      });
      setSelectedColumns(initialColumnState);

      // Initialize column search queries
      const initialSearchQueries = {};
      columns.forEach((column) => {
        initialSearchQueries[column.accessor] = "";
      });
      setColumnSearchQueries(initialSearchQueries);
    }
  }, [columns]);

  // Initialize row selection state when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const initialRowState = {};
      data.forEach((item) => {
        // By default, select all rows
        initialRowState[getRowId(item)] = true;
      });
      setSelectedRows(initialRowState);
    }
  }, [data]);

  // Function to generate unique row IDs
  const getRowId = (row) => {
    return row.id || row.uid || JSON.stringify(row);
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    if (generateDisabled) {
      // Show a friendly error when generation is disabled
      const message =
        generateDisabledMessage ||
        "Please complete required filters to generate the report.";
      setError(message);
      setIsReportGenerated(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setIsReportGenerated(false);

      // Reset search state
      setSearchQuery("");
      const initialSearchQueries = {};
      columns.forEach((column) => {
        initialSearchQueries[column.accessor] = "";
      });
      setColumnSearchQueries(initialSearchQueries);

      const response = await apiCallback(filterParams);

      if (response && Array.isArray(response)) {
        setData(response);
        setFilteredData(response);
        setDisplayedData(response.slice(0, visibleRecords));
        setIsReportGenerated(true);

        // Call the onDataLoaded callback if provided
        if (onDataLoaded && typeof onDataLoaded === "function") {
          onDataLoaded(response);
        }
      } else {
        throw new Error("Invalid response format. Expected an array.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate report");
      console.error("Error generating report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filtering based on search queries
  useEffect(() => {
    if (!data.length) return;

    let filtered = [...data];

    // Apply global search
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        columns.some((column) => {
          if (!column.accessor) return false;
          const value = item[column.accessor];
          return (
            value &&
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
      );
    }

    // Apply column-specific searches
    Object.entries(columnSearchQueries).forEach(([accessor, query]) => {
      if (query) {
        filtered = filtered.filter((item) => {
          const value = item[accessor];
          return (
            value && String(value).toLowerCase().includes(query.toLowerCase())
          );
        });
      }
    });

    setFilteredData(filtered);
    setVisibleRecords(recordsPerPage); // Reset pagination on new filter
  }, [searchQuery, columnSearchQueries, data, columns, recordsPerPage]);

  // Update displayed data when filtered data or visible records count changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedData(filteredData.slice(startIndex, endIndex));
  }, [filteredData, currentPage, itemsPerPage]);

  // Apply sorting
  const handleSort = (accessor) => {
    let direction = "asc";

    if (sortConfig.key === accessor) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else {
        // Reset sort if already desc
        setSortConfig({ key: null, direction: null });
        setFilteredData([...data]);
        return;
      }
    }

    const sorted = [...filteredData].sort((a, b) => {
      // Find column config to check for custom sort function
      const column = columns.find((col) => col.accessor === accessor);

      if (column && column.sortFunction) {
        return column.sortFunction(a, b, direction);
      }

      let valueA = a[accessor];
      let valueB = b[accessor];

      // Handle string comparison
      if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === "string") {
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setSortConfig({ key: accessor, direction });
    setFilteredData(sorted);
  };

  // Get sort icon based on current sort state
  const getSortIcon = (accessor) => {
    if (sortConfig.key !== accessor) {
      return <span className="text-gray-400 ml-1">↕</span>;
    }
    return sortConfig.direction === "asc" ? (
      <span className="text-primary-600 ml-1">↑</span>
    ) : (
      <span className="text-primary-600 ml-1">↓</span>
    );
  };

  // Handle load more
  const handleLoadMore = () => {
    setVisibleRecords((prev) => prev + recordsPerPage);
  };

  // Toggle column selection
  const toggleColumnSelection = (accessor) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [accessor]: !prev[accessor],
    }));
  };

  // Toggle row selection
  const toggleRowSelection = (rowId) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  // Toggle all rows selection
  const toggleAllRows = () => {
    const allSelected = Object.values(selectedRows).every(Boolean);

    const newState = {};
    Object.keys(selectedRows).forEach((rowId) => {
      newState[rowId] = !allSelected;
    });

    setSelectedRows(newState);
  };

  // Toggle all columns selection
  const toggleAllColumns = () => {
    const allSelected = Object.values(selectedColumns).every(Boolean);

    const newState = {};
    columns.forEach((column) => {
      newState[column.accessor] = !allSelected;
    });

    setSelectedColumns(newState);
  };

  // Handle column search
  const handleColumnSearch = (accessor, value) => {
    setColumnSearchQueries((prev) => ({
      ...prev,
      [accessor]: value,
    }));
  };

  // Prepare data for export
  const getExportData = () => {
    // Filter rows based on selection
    const selectedRowsData = displayedData.filter(
      (row) => selectedRows[getRowId(row)]
    );

    // Filter and transform columns based on selection
    return selectedRowsData.map((row, index) => {
      const rowData = {};

      // Add Sr No column if settings are shown
      if (showSettings) {
        rowData["Sr No"] = index + 1;
      }

      columns.forEach((column) => {
        if (selectedColumns[column.accessor]) {
          let value = row[column.accessor];

          // Use export formatter if provided
          if (column.exportFormat) {
            value = column.exportFormat(row);
          }

          rowData[column.Header || column.accessor] = value;
        }
      });
      return rowData;
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = getExportData();

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, title || "Report");

    const excelBuffer = write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "report"}.xlsx`;
    link.click();

    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = () => {
    const exportData = getExportData();

    // Use landscape with points for wider content
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    // Add title
    doc.setFontSize(16);
    doc.text(title || "Report", 40, 34);

    // Filter columns that are selected for export
    const selectedColumnDefs = columns.filter(
      (col) => selectedColumns[col.accessor]
    );

    // Prepare column headers and data rows for PDF
    let tableColumn = [];

    // Add Sr No column if settings are shown
    if (showSettings) {
      tableColumn.push("Sr No");
    }

    // Add other column headers
    tableColumn = [
      ...tableColumn,
      ...selectedColumnDefs.map((col) => col.Header || col.accessor),
    ];

    // Prepare data rows; normalize and strip unsupported characters for PDF
    const normalizePdfText = (val) => {
      if (val === undefined || val === null) return "";
      return String(val)
        .normalize("NFKD")
        .replace(/₹/g, "Rs ")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // control chars
        .replace(/[^\x20-\x7E]/g, "") // non-ASCII
        .replace(/\s+/g, " ")
        .trim();
    };

    const tableRows = exportData.map((item, index) => {
      const row = [];
      if (showSettings) {
        row.push(String(index + 1));
      }
      selectedColumnDefs.forEach((col) => {
        const key = col.Header || col.accessor;
        row.push(normalizePdfText(item[key]));
      });
      return row;
    });

    // Right align numeric amount columns and give them a minimum width
    // Include generic headers used across reports (e.g., Payment Reports uses 'Amount')
    const amountHeaders = ["Bill Amount", "Discount", "Final Amount", "Amount"];
    const columnStyles = {};
    tableColumn.forEach((header, idx) => {
      if (amountHeaders.includes(header)) {
        columnStyles[idx] = { halign: "right", minCellWidth: 100 };
      }
    });

    // Generate table with wrapping and tighter font size
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 46,
      theme: "grid",
      margin: { left: 40, right: 40 },
      tableWidth: "auto",
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
      columnStyles,
    });

    doc.save(`${title || "report"}.pdf`);
  };

  // Calculate stats
  const selectedRowCount = Object.values(selectedRows).filter(Boolean).length;
  const selectedColumnCount =
    Object.values(selectedColumns).filter(Boolean).length;

  // Handle records per page change
  const handleRecordsPerPageChange = (e) => {
    const newRecordsPerPage = parseInt(e.target.value, 10);
    setRecordsPerPage(newRecordsPerPage);
    setVisibleRecords(newRecordsPerPage);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      {/* Report Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-3 sm:mb-0">
            <button
              onClick={() => window.history.back()}
              className="flex items-center mr-3 px-3 py-1.5 rounded-full bg-white shadow-sm text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {title || "Report"}
            </h2>
          </div>
        </div>

        {/* Filter Area - Stack on mobile, flex on desktop */}
        <div className="mt-4 relative" style={{ zIndex: 1 }}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Custom filters - full width on mobile */}
            <div className="w-full sm:w-auto relative z-1">
              {filterComponent}
            </div>

            {/* Generate Button - full width on mobile */}
            <button
              onClick={handleGenerateReport}
              disabled={loading || generateDisabled}
              className={`w-full sm:w-auto px-4 py-2 rounded-md text-white font-medium focus:outline-none ${
                loading || generateDisabled
                  ? "bg-primary-300"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </div>
              ) : generateDisabled && generateDisabledMessage ? (
                generateDisabledMessage
              ) : (
                "Generate Report"
              )}
            </button>
          </div>

          {/* Stats and Settings */}
          {isReportGenerated && (
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Stats - left side */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {filteredData.length} records • {columns.length} columns
                  {showSettings &&
                    ` • ${selectedColumnCount} columns and ${selectedRowCount} rows selected for export`}
                </span>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  title={showSettings ? "Hide settings" : "Show settings"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {/* Search and Export - right side */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Global Search */}
                <div className="relative w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  />
                  <svg
                    className="absolute left-2.5 top-2 h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1.5 h-5 w-5 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center focus:outline-none"
                      title="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Hidden on mobile, visible on desktop */}
                <div className="hidden sm:flex items-center space-x-2">
                  {/* Export Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={exportToExcel}
                      className="px-3 py-1.5 bg-green-50 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-100 focus:outline-none inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Excel
                    </button>

                    <CSVLink
                      data={getExportData()}
                      filename={`${title || "report"}.csv`}
                      className="px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      CSV
                    </CSVLink>

                    <button
                      onClick={exportToPDF}
                      className="px-3 py-1.5 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      PDF
                    </button>
                  </div>

                  {/* Refresh Button */}
                  <button
                    onClick={handleGenerateReport}
                    className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 focus:outline-none"
                    title="Refresh Report"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                </div>

                {/* Mobile export menu button */}
                <div className="sm:hidden w-full flex justify-center mt-3">
                  <div className="flex space-x-3 w-full">
                    <button
                      onClick={exportToExcel}
                      className="flex-1 px-3 py-2 bg-green-50 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-100 focus:outline-none inline-flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Excel
                    </button>

                    <CSVLink
                      data={getExportData()}
                      filename={`${title || "report"}.csv`}
                      className="flex-1 px-3 py-2 bg-blue-50 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none inline-flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      CSV
                    </CSVLink>

                    <button
                      onClick={exportToPDF}
                      className="flex-1 px-3 py-2 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none inline-flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Content - Only shown after generation */}
      <div className="relative" style={{ zIndex: 1 }}>
        {isReportGenerated && (
          <>
            {/* Error Message */}
            {error && (
              <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* No Data Message - Only shown when data array is empty */}
            {data.length === 0 && !loading && !error && (
              <div className="px-6 py-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-2 text-gray-500">
                  No data available to display
                </p>
                <p className="text-sm text-gray-400">
                  Try adjusting your filters and generating the report again
                </p>
              </div>
            )}

            {/* Table - Always shown when data exists */}
            {data.length > 0 && !loading && !error && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border-collapse">
                    <thead className="bg-gray-50">
                      {/* Checkboxes Row - Only shown when settings are enabled */}
                      {showSettings && (
                        <tr className="border-b border-gray-200">
                          <th className="px-3 py-2 border-r border-gray-200 text-center">
                            <button
                              onClick={toggleAllRows}
                              className={`p-1.5 rounded-full ${
                                Object.values(selectedRows).every(Boolean)
                                  ? "bg-primary-100 text-primary-600"
                                  : "bg-gray-100 text-gray-500"
                              } hover:bg-primary-50 focus:outline-none`}
                              title={
                                Object.values(selectedRows).every(Boolean)
                                  ? "Hide all rows"
                                  : "Show all rows"
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </th>
                          <th className="px-3 py-2 border-r border-gray-200 text-center">
                            {/* Sr No column doesn't need a toggle button */}
                          </th>
                          {columns.map((column) => (
                            <th
                              key={`check-${column.accessor}`}
                              className="px-3 py-2 border-r border-gray-200 text-center"
                            >
                              <button
                                onClick={() =>
                                  toggleColumnSelection(column.accessor)
                                }
                                className={`p-1.5 rounded-full ${
                                  selectedColumns[column.accessor]
                                    ? "bg-primary-100 text-primary-600"
                                    : "bg-gray-100 text-gray-500"
                                } hover:bg-primary-50 focus:outline-none`}
                                title={
                                  selectedColumns[column.accessor]
                                    ? "Hide column"
                                    : "Show column"
                                }
                              >
                                {selectedColumns[column.accessor] ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                      clipRule="evenodd"
                                    />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                  </svg>
                                )}
                              </button>
                            </th>
                          ))}
                        </tr>
                      )}

                      {/* Headers Row */}
                      <tr className="border-b border-gray-200">
                        {showSettings && (
                          <>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Select
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                              Sr No
                            </th>
                          </>
                        )}
                        {columns.map((column) => (
                          <th
                            key={column.accessor}
                            scope="col"
                            className={`px-3 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap border-r border-gray-200 ${
                              selectedColumns[column.accessor]
                                ? "text-gray-500"
                                : "text-gray-400 bg-gray-50"
                            }`}
                            onClick={() =>
                              column.sortable !== false &&
                              handleSort(column.accessor)
                            }
                          >
                            <div className="flex items-center">
                              <span>{column.Header || column.accessor}</span>
                              {column.sortable !== false &&
                                getSortIcon(column.accessor)}
                            </div>
                          </th>
                        ))}
                      </tr>

                      {/* Column Search Row - Only shown when settings are enabled */}
                      {showSettings && (
                        <tr className="border-b border-gray-200">
                          <th className="px-2 py-2 border-r border-gray-200"></th>
                          <th className="px-2 py-2 border-r border-gray-200"></th>
                          {columns.map((column) => (
                            <th
                              key={`search-${column.accessor}`}
                              className="px-2 py-2 border-r border-gray-200"
                            >
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder={`Search...`}
                                  value={
                                    columnSearchQueries[column.accessor] || ""
                                  }
                                  onChange={(e) =>
                                    handleColumnSearch(
                                      column.accessor,
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 pr-7 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                                />
                                {columnSearchQueries[column.accessor] && (
                                  <button
                                    onClick={() =>
                                      handleColumnSearch(column.accessor, "")
                                    }
                                    className="absolute right-1.5 top-1 h-4 w-4 text-gray-400 hover:text-gray-600 rounded-full flex items-center justify-center focus:outline-none"
                                    title="Clear search"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-3 w-3"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayedData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={
                              showSettings ? columns.length + 2 : columns.length
                            }
                            className="px-3 py-6 text-center text-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <svg
                                className="h-10 w-10 text-gray-400 mb-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <p className="text-gray-500 font-medium">
                                No matching records found
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                Try adjusting your search criteria
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        displayedData.map((row, index) => {
                          const rowId = getRowId(row);
                          const isRowSelected = selectedRows[rowId];
                          return (
                            <tr
                              key={rowId}
                              className={!isRowSelected ? "bg-gray-50" : ""}
                            >
                              {showSettings && (
                                <>
                                  <td className="px-3 py-2 whitespace-nowrap border-r border-gray-200">
                                    <button
                                      onClick={() => toggleRowSelection(rowId)}
                                      className={`p-1.5 rounded-full ${
                                        isRowSelected
                                          ? "bg-primary-100 text-primary-600"
                                          : "bg-gray-100 text-gray-500"
                                      } hover:bg-primary-50 focus:outline-none`}
                                      title={
                                        isRowSelected ? "Hide row" : "Show row"
                                      }
                                    >
                                      {isRowSelected ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                          <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4"
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                            clipRule="evenodd"
                                          />
                                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                      )}
                                    </button>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap border-r border-gray-200 text-center font-medium">
                                    {index + 1}
                                  </td>
                                </>
                              )}
                              {columns.map((column) => (
                                <td
                                  key={`${rowId}-${column.accessor}`}
                                  className={`px-3 py-2 whitespace-nowrap border-r border-gray-200 ${
                                    !isRowSelected
                                      ? "bg-gray-50 text-gray-400"
                                      : selectedColumns[column.accessor]
                                      ? ""
                                      : "bg-gray-50 text-gray-400"
                                  }`}
                                >
                                  {column.Cell
                                    ? column.Cell(row)
                                    : row[column.accessor]}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
                  {/* Left Side: Records Per Page and Showing Info */}
                  <div className="flex items-center gap-4">
                    {/* Records Per Page Dropdown */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="recordsPerPage"
                        className="text-sm text-gray-500 whitespace-nowrap mr-1"
                      >
                        Records per page:
                      </label>
                      <select
                        id="recordsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1); // reset to first page
                        }}
                        className="px-2 py-1 pr-8 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                      >
                        {[5, 10, 20, 50, 100].map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Showing Info */}
                    <div className="text-sm text-gray-500">
                      Showing{" "}
                      <span className="font-medium">{startIndex + 1}</span> -{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, totalItems)}
                      </span>{" "}
                      of <span className="font-medium">{totalItems}</span>{" "}
                      records
                    </div>
                  </div>

                  {/* Right Side: Page Navigation and Export Buttons */}
                  <div className="flex items-center gap-4">
                    {/* Pagination Controls */}
                    {filteredData.length > recordsPerPage && (
                      <div className="flex items-center gap-1">
                        {(() => {
                          const totalPages = Math.ceil(
                            filteredData.length / recordsPerPage
                          );

                          // Determine start and end page numbers to show max 5 pages
                          let startPage = Math.max(1, currentPage - 2);
                          let endPage = startPage + 3;
                          if (endPage > totalPages) {
                            endPage = totalPages;
                            startPage = Math.max(1, endPage - 4);
                          }
                          const pages = [];
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(i);
                          }

                          return (
                            <>
                              <button
                                onClick={() =>
                                  setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                disabled={currentPage === 1}
                                className="px-2 py-1 border rounded-md text-sm disabled:opacity-50"
                              >
                                Prev
                              </button>

                              {pages.map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`px-2 py-1 border rounded-md text-sm ${
                                    currentPage === page
                                      ? "bg-purple-600 text-white border-purple-600"
                                      : "bg-white text-gray-500 border-gray-300"
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}

                              <button
                                onClick={() =>
                                  setCurrentPage((p) =>
                                    Math.min(totalPages, p + 1)
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="px-2 py-1 border rounded-md text-sm disabled:opacity-50"
                              >
                                Next
                              </button>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Export Buttons */}
                    <></>
                    <div className="flex space-x-2">
                      <button
                        onClick={exportToExcel}
                        className="px-3 py-1.5 bg-green-50 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-100 focus:outline-none inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Excel
                      </button>
                      <CSVLink
                        data={getExportData()}
                        filename={`${title || "report"}.csv`}
                        className="px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        CSV
                      </CSVLink>
                      <button
                        onClick={exportToPDF}
                        className="px-3 py-1.5 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportTable;
