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
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Define columns for the report table
  const columns = [
    {
      Header: 'Item Name',
      accessor: 'name',
      Cell: (row) => (
        <div>
          <span className="font-medium">{row.name}</span>
          {row.description && (
            <p className="text-xs text-gray-500 mt-1">{row.description}</p>
          )}
        </div>
      ),
      exportFormat: (row) => row.name
    },
    {
      Header: 'Category',
      accessor: 'category',
      Cell: (row) => row.category || 'Uncategorized',
      exportFormat: (row) => row.category || 'Uncategorized'
    },
    {
      Header: 'Quantity',
      accessor: 'quantity',
      Cell: (row) => {
        const unit = row.unit_of_measure || row.unit || row.uom || row.unit_name || 'units';
        const qty = Number(row.quantity || 0);
        return `${qty} ${unit}`;
      },
      exportFormat: (row) => {
        const unit = row.unit_of_measure || row.unit || row.uom || row.unit_name || 'units';
        const qty = Number(row.quantity || 0);
        return `${qty} ${unit}`;
      }
    },
    {
      Header: 'Unit Price',
      accessor: 'unit_price',
      Cell: (row) => {
        const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
        return formatter.format(Number(row.unit_price || 0));
      },
      exportFormat: (row) => Number(row.unit_price || 0)
    },
    {
      Header: 'Total Value',
      accessor: 'total_value',
      Cell: (row) => {
        const totalValue = Number(row.quantity || 0) * Number(row.unit_price || 0);
        const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
        return formatter.format(totalValue || 0);
      },
      exportFormat: (row) => Number(row.quantity || 0) * Number(row.unit_price || 0)
    },
    {
      Header: 'Supplier',
      accessor: 'supplier',
      Cell: (row) => {
        const supplier = row.supplier || {};
        return supplier.name || supplier.supplier_name || supplier.company_name || 'N/A';
      },
      exportFormat: (row) => {
        const supplier = row.supplier || {};
        return supplier.name || supplier.supplier_name || supplier.company_name || '';
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
      newParams.filter_type = 'in_or_out';
      newParams.in_or_out = value;
    }
    
    // Preserve supplier filter if it exists
    if (selectedSupplier) {
      newParams.supplier_id = selectedSupplier;
    }
    
    setFilterParams(newParams);
  };

  // Handle supplier filter change
  const handleSupplierChange = (e) => {
    const value = e.target.value;
    setSelectedSupplier(value);
    
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
        
        // If a supplier is selected, filter the results to only show that supplier
        if (params.supplier_id) {
          return inventoryItems.filter(item => {
            const supplierId = item.supplier?.supplier_id || item.supplier?.id;
            return supplierId == params.supplier_id;
          });
        }
        
        return inventoryItems;
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
          className="block w-full rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Transactions</option>
          <option value="in">Inventory In</option>
          <option value="out">Inventory Out</option>
        </select>
      </div>
      
      <div>
        <select
          value={selectedSupplier}
          onChange={handleSupplierChange}
          className="block w-full rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
    { text: 'Home', url: '/' },
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