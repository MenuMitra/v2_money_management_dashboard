import { useState, useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { utils, write } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const RECORDS_PER_PAGE = 15; // Number of records to show initially and on each "Load More" click

const ReportTable = ({
  title,
  columns,
  apiCallback,
  filterParams = {},
  filterComponent,
  initialSortConfig = { key: null, direction: null },
  onDataLoaded
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [displayedData, setDisplayedData] = useState([]);
  const [visibleRecords, setVisibleRecords] = useState(RECORDS_PER_PAGE);
  const [sortConfig, setSortConfig] = useState(initialSortConfig);
  const [selectedColumns, setSelectedColumns] = useState({});
  const [selectedRows, setSelectedRows] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [columnSearchQueries, setColumnSearchQueries] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  // Initialize column selection state
  useEffect(() => {
    if (columns && columns.length > 0) {
      const initialColumnState = {};
      columns.forEach(column => {
        // By default, include all columns except those marked as excludeFromExport
        initialColumnState[column.accessor] = !column.excludeFromExport;
      });
      setSelectedColumns(initialColumnState);
      
      // Initialize column search queries
      const initialSearchQueries = {};
      columns.forEach(column => {
        initialSearchQueries[column.accessor] = '';
      });
      setColumnSearchQueries(initialSearchQueries);
    }
  }, [columns]);

  // Initialize row selection state when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      const initialRowState = {};
      data.forEach(item => {
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
    try {
      setLoading(true);
      setError(null);
      setIsReportGenerated(false);
      
      const response = await apiCallback(filterParams);
      
      if (response && Array.isArray(response)) {
        setData(response);
        setFilteredData(response);
        setDisplayedData(response.slice(0, visibleRecords));
        setIsReportGenerated(true);
        
        // Call the onDataLoaded callback if provided
        if (onDataLoaded && typeof onDataLoaded === 'function') {
          onDataLoaded(response);
        }
      } else {
        throw new Error('Invalid response format. Expected an array.');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
      console.error('Error generating report:', err);
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
      filtered = filtered.filter(item => 
        columns.some(column => {
          if (!column.accessor) return false;
          const value = item[column.accessor];
          return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }
    
    // Apply column-specific searches
    Object.entries(columnSearchQueries).forEach(([accessor, query]) => {
      if (query) {
        filtered = filtered.filter(item => {
          const value = item[accessor];
          return value && String(value).toLowerCase().includes(query.toLowerCase());
        });
      }
    });
    
    setFilteredData(filtered);
    setVisibleRecords(RECORDS_PER_PAGE); // Reset pagination on new filter
  }, [searchQuery, columnSearchQueries, data, columns]);

  // Update displayed data when filtered data or visible records count changes
  useEffect(() => {
    setDisplayedData(filteredData.slice(0, visibleRecords));
  }, [filteredData, visibleRecords]);

  // Apply sorting
  const handleSort = (accessor) => {
    let direction = 'asc';
    
    if (sortConfig.key === accessor) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else {
        // Reset sort if already desc
        setSortConfig({ key: null, direction: null });
        setFilteredData([...data]);
        return;
      }
    }
    
    const sorted = [...filteredData].sort((a, b) => {
      // Find column config to check for custom sort function
      const column = columns.find(col => col.accessor === accessor);
      
      if (column && column.sortFunction) {
        return column.sortFunction(a, b, direction);
      }
      
      let valueA = a[accessor];
      let valueB = b[accessor];
      
      // Handle string comparison
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
      }
      if (typeof valueB === 'string') {
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === 'asc' ? 1 : -1;
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
    return sortConfig.direction === 'asc' 
      ? <span className="text-primary-600 ml-1">↑</span> 
      : <span className="text-primary-600 ml-1">↓</span>;
  };

  // Handle load more
  const handleLoadMore = () => {
    setVisibleRecords(prev => prev + RECORDS_PER_PAGE);
  };

  // Toggle column selection
  const toggleColumnSelection = (accessor) => {
    setSelectedColumns(prev => ({
      ...prev,
      [accessor]: !prev[accessor]
    }));
  };

  // Toggle row selection
  const toggleRowSelection = (rowId) => {
    setSelectedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Toggle all rows selection
  const toggleAllRows = () => {
    const allSelected = Object.values(selectedRows).every(Boolean);
    
    const newState = {};
    Object.keys(selectedRows).forEach(rowId => {
      newState[rowId] = !allSelected;
    });
    
    setSelectedRows(newState);
  };

  // Toggle all columns selection
  const toggleAllColumns = () => {
    const allSelected = Object.values(selectedColumns).every(Boolean);
    
    const newState = {};
    columns.forEach(column => {
      newState[column.accessor] = !allSelected;
    });
    
    setSelectedColumns(newState);
  };

  // Handle column search
  const handleColumnSearch = (accessor, value) => {
    setColumnSearchQueries(prev => ({
      ...prev,
      [accessor]: value
    }));
  };

  // Prepare data for export
  const getExportData = () => {
    // Filter rows based on selection
    const selectedRowsData = displayedData.filter(row => 
      selectedRows[getRowId(row)]
    );
    
    // Filter and transform columns based on selection
    return selectedRowsData.map((row, index) => {
      const rowData = {};
      
      // Add Sr No column if settings are shown
      if (showSettings) {
        rowData['Sr No'] = index + 1;
      }
      
      columns.forEach(column => {
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
    utils.book_append_sheet(wb, ws, title || 'Report');
    
    const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'report'}.xlsx`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = () => {
    const exportData = getExportData();
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(title || 'Report', 14, 22);
    
    // Filter columns that are selected for export
    const selectedColumnDefs = columns.filter(col => 
      selectedColumns[col.accessor]
    );
    
    // Prepare column headers and data rows for PDF
    let tableColumn = [];
    
    // Add Sr No column if settings are shown
    if (showSettings) {
      tableColumn.push('Sr No');
    }
    
    // Add other column headers
    tableColumn = [...tableColumn, ...selectedColumnDefs.map(col => col.Header || col.accessor)];
    
    // Prepare data rows
    const tableRows = exportData.map((item, index) => {
      const row = [];
      
      // Add Sr No if settings are shown
      if (showSettings) {
        row.push(String(index + 1));
      }
      
      // Add other column values
      selectedColumnDefs.forEach(col => {
        const value = item[col.Header || col.accessor];
        row.push(value !== undefined && value !== null ? String(value) : '');
      });
      
      return row;
    });
    
    // Generate table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: { fontSize: 10 }
    });
    
    doc.save(`${title || 'report'}.pdf`);
  };

  // Calculate stats
  const selectedRowCount = Object.values(selectedRows).filter(Boolean).length;
  const selectedColumnCount = Object.values(selectedColumns).filter(Boolean).length;
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
      {/* Report Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => window.history.back()}
              className="mr-3 text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-lg font-semibold text-gray-800">{title || 'Report'}</h2>
          </div>
        </div>
        
        {/* Filter Area - Centered with Generate Button */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {filterComponent}
            
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none ${
                loading ? 'bg-primary-300' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </div>
              ) : "Generate Report"}
            </button>
          </div>
          
          {/* Stats and Settings */}
          {isReportGenerated && (
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {filteredData.length} records • {columns.length} columns
                  {showSettings && ` • ${selectedColumnCount} columns and ${selectedRowCount} rows selected for export`}
                </span>
                
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                  title={showSettings ? "Hide settings" : "Show settings"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Export Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={exportToExcel}
                    className="px-3 py-1.5 bg-green-50 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-100 focus:outline-none inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z" clipRule="evenodd" />
                    </svg>
                    Excel
                  </button>
                  
                  <CSVLink
                    data={getExportData()}
                    filename={`${title || 'report'}.csv`}
                    className="px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z" clipRule="evenodd" />
                    </svg>
                    CSV
                  </CSVLink>
                  
                  <button
                    onClick={exportToPDF}
                    className="px-3 py-1.5 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z" clipRule="evenodd" />
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                
                {/* Global Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm w-48"
                  />
                  <svg
                    className="absolute left-2.5 top-2 h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Report Content - Only shown after generation */}
      {isReportGenerated && (
        <>
          {/* Search and Export Tools - Only shown when settings are enabled */}
        
          {/* Error Message */}
          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-100">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {displayedData.length === 0 && !loading && !error && (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-gray-500">No data available to display</p>
              <p className="text-sm text-gray-400">Try adjusting your filters and generating the report again</p>
            </div>
          )}
          
          {/* Table */}
          {displayedData.length > 0 && !loading && !error && (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border-collapse">
                  <thead className="bg-gray-50">
                    {/* Checkboxes Row - Only shown when settings are enabled */}
                    {showSettings && (
                      <tr>
                        <th className="px-3 py-2 border-r border-gray-200 text-center">
                          <button
                            onClick={toggleAllRows}
                            className={`p-1.5 rounded-full ${Object.values(selectedRows).every(Boolean) ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'} hover:bg-primary-50 focus:outline-none`}
                            title={Object.values(selectedRows).every(Boolean) ? "Hide all rows" : "Show all rows"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </th>
                        <th className="px-3 py-2 border-r border-gray-200 text-center">
                          {/* Sr No column doesn't need a toggle button */}
                        </th>
                        {columns.map(column => (
                          <th key={`check-${column.accessor}`} className="px-3 py-2 border-r border-gray-200 text-center">
                            <button
                              onClick={() => toggleColumnSelection(column.accessor)}
                              className={`p-1.5 rounded-full ${selectedColumns[column.accessor] ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'} hover:bg-primary-50 focus:outline-none`}
                              title={selectedColumns[column.accessor] ? "Hide column" : "Show column"}
                            >
                              {selectedColumns[column.accessor] ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                </svg>
                              )}
                            </button>
                          </th>
                        ))}
                      </tr>
                    )}
                    
                    {/* Column Search Row - Only shown when settings are enabled */}
                    {showSettings && (
                      <tr>
                        <th className="px-2 py-2 border-r border-gray-200"></th>
                        <th className="px-2 py-2 border-r border-gray-200"></th>
                        {columns.map(column => (
                          <th key={`search-${column.accessor}`} className="px-2 py-2 border-r border-gray-200">
                            <input
                              type="text"
                              placeholder={`Search...`}
                              value={columnSearchQueries[column.accessor] || ''}
                              onChange={e => handleColumnSearch(column.accessor, e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                          </th>
                        ))}
                      </tr>
                    )}
                    
                    {/* Headers Row */}
                    <tr>
                      {showSettings && (
                        <>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Select
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                            Sr No
                          </th>
                        </>
                      )}
                      {columns.map(column => (
                        <th
                          key={column.accessor}
                          scope="col"
                          className={`px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer whitespace-nowrap border-r border-gray-200 ${
                            selectedColumns[column.accessor] ? 'text-gray-500' : 'text-gray-400 bg-gray-50'
                          }`}
                          onClick={() => column.sortable !== false && handleSort(column.accessor)}
                        >
                          <div className="flex items-center">
                            <span>{column.Header || column.accessor}</span>
                            {column.sortable !== false && getSortIcon(column.accessor)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedData.map((row, index) => {
                      const rowId = getRowId(row);
                      const isRowSelected = selectedRows[rowId];
                      return (
                        <tr 
                          key={rowId}
                          className={!isRowSelected ? 'bg-gray-50' : ''}
                        >
                          {showSettings && (
                            <>
                              <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200">
                                <button
                                  onClick={() => toggleRowSelection(rowId)}
                                  className={`p-1.5 rounded-full ${isRowSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'} hover:bg-primary-50 focus:outline-none`}
                                  title={isRowSelected ? "Hide row" : "Show row"}
                                >
                                  {isRowSelected ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                  )}
                                </button>
                              </td>
                              <td className="px-3 py-3 whitespace-nowrap border-r border-gray-200 text-center font-medium">
                                {index + 1}
                              </td>
                            </>
                          )}
                          {columns.map(column => (
                            <td 
                              key={`${rowId}-${column.accessor}`} 
                              className={`px-3 py-3 whitespace-nowrap border-r border-gray-200 ${
                                !isRowSelected ? 'bg-gray-50 text-gray-400' : 
                                selectedColumns[column.accessor] ? '' : 'bg-gray-50 text-gray-400'
                              }`}
                            >
                              {column.Cell ? column.Cell(row) : row[column.accessor]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-3 border-t border-gray-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">{Math.min(visibleRecords, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> records
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {filteredData.length > visibleRecords && (
                      <button
                        onClick={handleLoadMore}
                        className="px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                      >
                        Load More
                      </button>
                    )}
                    
                    {/* Export Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={exportToExcel}
                        className="px-3 py-1.5 bg-green-50 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-100 focus:outline-none inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z" clipRule="evenodd" />
                        </svg>
                        Excel
                      </button>
                      
                      <CSVLink
                        data={getExportData()}
                        filename={`${title || 'report'}.csv`}
                        className="px-3 py-1.5 bg-blue-50 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z" clipRule="evenodd" />
                        </svg>
                        CSV
                      </CSVLink>
                      
                      <button
                        onClick={exportToPDF}
                        className="px-3 py-1.5 bg-red-50 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-8.707a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L9 9.586V3a1 1 0 10-2 0v6.586l-1.293-1.293z" clipRule="evenodd" />
                        </svg>
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReportTable; 