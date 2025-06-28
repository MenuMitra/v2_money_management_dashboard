import React, { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { api, API_PATHS } from '../../api';

export default function InventoryReports() {
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [inOutFilter, setInOutFilter] = useState('all');

  // Define columns for the report table - updated to match exact API response structure
  const columns = [
    {
      header: 'Item Name',
      accessor: 'name',
      Cell: (row) => (
        <div>
          <span className="font-medium">{row.name}</span>
          {row.description && (
            <p className="text-xs text-gray-500 mt-1">{row.description}</p>
          )}
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      Cell: (row) => row.category || 'Uncategorized'
    },
    {
      header: 'Quantity',
      accessor: 'quantity',
      Cell: (row) => `${row.quantity || 0} ${row.unit_of_measure || 'units'}`
    },
    {
      header: 'Unit Price',
      accessor: 'unit_price',
      Cell: (row) => `₹${Number(row.unit_price || 0).toFixed(2)}`
    },
    {
      header: 'Total Value',
      accessor: 'total_value',
      Cell: (row) => {
        const totalValue = (row.quantity || 0) * (row.unit_price || 0);
        return `₹${totalValue.toFixed(2)}`;
      }
    },
    {
      header: 'Supplier',
      accessor: 'supplier',
      Cell: (row) => {
        const supplier = row.supplier;
        return supplier && supplier.name ? supplier.name : 'N/A';
      }
    }
  ];

  // Handle in/out filter change
  const handleInOutFilterChange = (e) => {
    const { value } = e.target;
    setInOutFilter(value);
    
    // Create a new params object
    const newParams = { ...filterParams };
    
    if (value === 'all') {
      delete newParams.filter_type;
      delete newParams.in_or_out;
    } else {
      newParams.filter_type = ['in_or_out'];
      newParams.in_or_out = value;
    }
    
    // Preserve supplier filter if it exists
    if (filterParams.supplier_id) {
      newParams.supplier_id = filterParams.supplier_id;
    }
    
    setFilterParams(newParams);
  };

  // Handle supplier filter change
  const handleSupplierChange = (e) => {
    const value = e.target.value;
    const newParams = { ...filterParams };
    
    if (value) {
      newParams.supplier_id = value;
    } else {
      delete newParams.supplier_id;
    }
    
    setFilterParams(newParams);
  };

  // Load suppliers for the filter dropdown
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        // Use POST method as specified
        const response = await api.post(API_PATHS.reportFilterSupplier, {
          outlet_id: localStorage.getItem('outlet_id'),
          user_id: localStorage.getItem('user_id'),
          app_source: "owner_app"
        });
        
        if (response.data && response.data.detail && Array.isArray(response.data.detail)) {
          setSuppliers(response.data.detail);
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
      } finally {
        setLoadingSuppliers(false);
      }
    };
    
    loadSuppliers();
  }, []);

  // Custom API callback to handle the nested response format
  const customInventoryApiCallback = async (params) => {
    try {
      const response = await api.post(API_PATHS.inventoryReport, {
        ...params,
        outlet_id: localStorage.getItem('outlet_id'),
        user_id: localStorage.getItem('user_id')
      });
      
      if (response.data && response.data.detail) {
        // Extract inventory items
        const inventoryItems = response.data.detail.inventory_items || [];
        
        // Process inventory items to ensure they have unique IDs for the table
        const processedItems = inventoryItems.map((item) => ({
          ...item
        }));
        
        return processedItems;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error;
    }
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <select
          value={inOutFilter}
          onChange={handleInOutFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Transactions</option>
          <option value="in">Inventory In</option>
          <option value="out">Inventory Out</option>
        </select>
      </div>
      
      <div>
        <select
          value={filterParams.supplier_id || ''}
          onChange={handleSupplierChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={loadingSuppliers}
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

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Dashboard', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Inventory Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <ReportTable
        title="Inventory Reports"
        columns={columns}
        apiCallback={customInventoryApiCallback}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'name', direction: 'asc' }}
      />
    </div>
  );
} 