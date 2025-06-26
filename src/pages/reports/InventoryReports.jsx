import React, { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import DateRangePicker from '../../components/DateRangePicker';
import { getInventoryReport } from '../../api/reports';
import { api, API_PATHS } from '../../api';

export default function InventoryReports() {
  const [suppliers, setSuppliers] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });

  // Fetch summary data when inventory data is loaded
  const onDataLoaded = (data) => {
    if (data && data.length > 0 && data[0].summaryData) {
      setSummaryData(data[0].summaryData);
    }
  };

  // Define columns for the report table - updated to match exact API response structure
  const columns = [
    {
      header: 'Item Name',
      accessorKey: 'name',
      cell: info => (
        <div>
          <span className="font-medium">{info.getValue()}</span>
          {info.row.original.description && (
            <p className="text-xs text-gray-500 mt-1">{info.row.original.description}</p>
          )}
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: info => info.getValue() || 'Uncategorized'
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: info => {
        const item = info.row.original;
        return `${item.quantity || 0} ${item.unit_of_measure || 'units'}`;
      }
    },
    {
      header: 'Unit Price',
      accessorKey: 'unit_price',
      cell: info => `₹${Number(info.getValue() || 0).toFixed(2)}`
    },
    {
      header: 'Total Value',
      accessorKey: 'total_value',
      cell: info => {
        const item = info.row.original;
        const totalValue = (item.quantity || 0) * (item.unit_price || 0);
        return `₹${totalValue.toFixed(2)}`;
      }
    },
    {
      header: 'Supplier',
      // Changed from supplier.name to match the actual structure
      accessorKey: 'supplier',
      cell: info => {
        const supplier = info.getValue();
        return supplier && supplier.name ? supplier.name : 'N/A';
      }
    },
    {
      header: 'Created On',
      accessorKey: 'created_on',
      cell: info => info.getValue() || 'N/A'
    }
  ];

  // Handle date range selection
  const handleDateRangeChange = (dateRange) => {
    // Create a new params object
    const newParams = { filter_type: 'all' };
    
    if (dateRange.type === 'custom') {
      newParams.start_date = dateRange.startDate;
      newParams.end_date = dateRange.endDate;
    } else if (dateRange.type !== 'all') {
      newParams.date_range = dateRange.type;
    }
    
    // Preserve supplier filter if it exists
    if (filterParams.supplier_id) {
      newParams.filter_type = 'supplier';
      newParams.supplier_id = filterParams.supplier_id;
    }
    
    setFilterParams(newParams);
  };

  // Handle supplier filter change
  const handleSupplierChange = (e) => {
    const value = e.target.value;
    
    if (value) {
      setFilterParams({
        ...filterParams,
        filter_type: 'supplier',
        supplier_id: value
      });
    } else {
      // If no supplier is selected, reset to 'all'
      const newParams = { filter_type: 'all' };
      
      // Keep date range if it exists
      if (filterParams.start_date && filterParams.end_date) {
        newParams.start_date = filterParams.start_date;
        newParams.end_date = filterParams.end_date;
      } else if (filterParams.date_range) {
        newParams.date_range = filterParams.date_range;
      }
      
      setFilterParams(newParams);
    }
  };

  // Load suppliers for the filter dropdown
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        // Use GET method as specified
        const response = await api.get(API_PATHS.reportFilterSupplier);
        
        if (response.data && response.data.detail && Array.isArray(response.data.detail)) {
          setSuppliers(response.data.detail);
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      }
    };
    
    loadSuppliers();
  }, []);

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>
      
      <div>
        <select
          value={filterParams.supplier_id || ''}
          onChange={handleSupplierChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">All Suppliers</option>
          {suppliers.map(supplier => (
            <option key={supplier.supplier_id || supplier.id} value={supplier.supplier_id || supplier.id}>
              {supplier.name || supplier.supplier_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Render summary cards
  const renderSummaryCards = () => {
    if (!summaryData) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Items</h3>
          <p className="text-2xl font-bold text-primary-600">{summaryData.total_items || 0}</p>
          <p className="text-sm text-gray-500">Inventory items</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Value</h3>
          <p className="text-2xl font-bold text-primary-600">₹{(summaryData.total_inventory_value || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500">Current inventory value</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Low Stock Items</h3>
          <p className="text-2xl font-bold text-yellow-600">{summaryData.items_below_reorder_level || 0}</p>
          <p className="text-sm text-gray-500">Items below reorder level</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
          <p className="text-2xl font-bold text-primary-600">
            {summaryData.category_breakdown ? Object.keys(summaryData.category_breakdown).length : 0}
          </p>
          <p className="text-sm text-gray-500">Inventory categories</p>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze inventory data across your outlet
        </p>
      </div>
      
      {summaryData && renderSummaryCards()}
      
      <ReportTable
        title="Inventory Reports"
        columns={columns}
        apiCallback={getInventoryReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'name', direction: 'asc' }}
        onDataLoaded={onDataLoaded}
      />
    </div>
  );
} 