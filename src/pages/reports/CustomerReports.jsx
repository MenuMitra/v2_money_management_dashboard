import { useState } from 'react';
import { ReportTable } from '../../components/common';
import DateRangePicker from '../../components/DateRangePicker';
import { getCustomerReport } from '../../api/reports';

export default function CustomerReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });

  // Define columns for the report table
  const columns = [
    {
      Header: 'Customer Name',
      accessor: 'customer_name',
      minWidth: 180,
      Cell: (row) => (
        <div className="font-medium text-gray-900 whitespace-nowrap">
          {row.customer_name || 'N/A'}
        </div>
      )
    },
    {
      Header: 'Mobile',
      accessor: 'customer_mobile',
      minWidth: 140,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.customer_mobile || 'N/A'}
        </div>
      )
    },
    {
      Header: 'Address',
      accessor: 'customer_address',
      minWidth: 200,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.customer_address || 'N/A'}
        </div>
      )
    },
    {
      Header: 'Total Orders',
      accessor: 'total_orders',
      minWidth: 120,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.total_orders || 0}
        </div>
      )
    },
    {
      Header: 'Total Spent',
      accessor: 'total_spent',
      minWidth: 140,
      Cell: (row) => (
        <div className="font-medium text-gray-900 whitespace-nowrap">
          ₹{Number(row.total_spent || 0).toFixed(2)}
        </div>
      ),
      exportFormat: (row) => `₹${Number(row.total_spent || 0).toFixed(2)}`,
      sortFunction: (a, b, direction) => {
        const aValue = Number(a.total_spent || 0);
        const bValue = Number(b.total_spent || 0);
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
    },
    {
      Header: 'First Order',
      accessor: 'first_order_date',
      minWidth: 130,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.first_order_date || 'N/A'}
        </div>
      )
    },
    {
      Header: 'Last Order',
      accessor: 'last_order_date',
      minWidth: 130,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.last_order_date || 'N/A'}
        </div>
      )
    },
    {
      Header: 'Order Types',
      accessor: 'order_types',
      minWidth: 180,
      Cell: (row) => {
        if (!row.order_types) return <div className="text-sm text-gray-500">N/A</div>;
        
        return (
          <div className="space-y-1 whitespace-nowrap">
            {Object.entries(row.order_types).map(([type, count]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-gray-500 capitalize">{type}:</span>
                <span className="text-gray-900 font-medium ml-2">{count}</span>
              </div>
            ))}
          </div>
        );
      },
      exportFormat: (row) => {
        if (!row.order_types) return 'N/A';
        return Object.entries(row.order_types)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ');
      }
    }
  ];

  // Handle date range selection
  const handleDateRangeChange = (dateRange) => {
    // Create a new params object
    const newParams = { filter_type: 'all' };
    
    if (dateRange.type === 'custom') {
      newParams.filter_type = 'date_range';
      newParams.start_date = dateRange.startDate;
      newParams.end_date = dateRange.endDate;
    } else if (dateRange.type !== 'all') {
      newParams.filter_type = 'date_range';
      newParams.date_range = dateRange.type;
    }
    
    // Preserve any order_type filter if it exists
    if (filterParams.order_type && filterParams.order_type !== 'all') {
      newParams.order_type = filterParams.order_type;
    }
    
    setFilterParams(newParams);
  };

  // Handle order type filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'order_type') {
      const newParams = { ...filterParams };
      
      if (value === 'all') {
        // Remove order_type if "all" is selected
        delete newParams.order_type;
      } else {
        // Add the order_type if a specific type is selected
        newParams.order_type = value;
      }
      
      setFilterParams(newParams);
    }
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>
      
      <div>
        <select
          name="order_type"
          value={filterParams.order_type || 'all'}
          onChange={handleFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Order Types</option>
          <option value="dine-in">Dine In</option>
          <option value="takeaway">Takeaway</option>
          <option value="delivery">Delivery</option>
          <option value="parcel">Parcel</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Customer Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze customer data across your outlet
        </p>
      </div>
      
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <ReportTable
            title="Customer Reports"
            columns={columns}
            apiCallback={getCustomerReport}
            filterParams={filterParams}
            filterComponent={renderFilters()}
            initialSortConfig={{ key: 'total_spent', direction: 'desc' }}
          />
        </div>
      </div>
    </div>
  );
} 