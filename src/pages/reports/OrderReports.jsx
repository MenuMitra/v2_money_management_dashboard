import { useState } from 'react';
import { ReportTable } from '../../components/common';
import DateRangePicker from '../../components/DateRangePicker';
import { getOrderReport } from '../../api/reports';

export default function OrderReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });

  // Define columns for the report table
  const columns = [
    {
      Header: 'Order No',
      accessor: 'order_number',
      Cell: (row) => (
        <div className="font-medium text-gray-900">
          #{row.order_number || row.order_id}
        </div>
      ),
      exportFormat: (row) => `#${row.order_number || row.order_id}`
    },
    {
      Header: 'Customer',
      accessor: 'customer_name',
      Cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.customer_name || 'Walk-in Customer'}</div>
          {row.customer_mobile && <div className="text-xs text-gray-500">{row.customer_mobile}</div>}
        </div>
      ),
      exportFormat: (row) => `${row.customer_name || 'Walk-in Customer'} ${row.customer_mobile ? `(${row.customer_mobile})` : ''}`
    },
    {
      Header: 'Date',
      accessor: 'created_on',
      Cell: (row) => (
        <div className="text-sm text-gray-500">
          {row.created_on}
        </div>
      )
    },
    {
      Header: 'Type',
      accessor: 'order_type',
      Cell: (row) => (
        <div className="text-sm capitalize">
          {row.order_type}
        </div>
      )
    },
    {
      Header: 'Order Status',
      accessor: 'order_status',
      Cell: (row) => {
        const statusColors = {
          paid: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
          default: 'bg-gray-100 text-gray-800'
        };
        
        const status = row.order_status?.toLowerCase() || 'default';
        const colorClass = statusColors[status] || statusColors.default;
        
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {row.order_status}
          </span>
        );
      }
    },
    {
      Header: 'Payment',
      accessor: 'payment_method',
      Cell: (row) => (
        <div className="text-sm text-gray-500 capitalize">
          {row.payment_method || 'N/A'}
        </div>
      )
    },
    {
      Header: 'Bill Amount',
      accessor: 'total_bill_amount',
      Cell: (row) => (
        <div className="text-sm text-gray-500">
          ₹{Number(row.total_bill_amount || 0).toFixed(2)}
        </div>
      ),
      exportFormat: (row) => `₹${Number(row.total_bill_amount || 0).toFixed(2)}`
    },
    {
      Header: 'Discount',
      accessor: 'discount_amount',
      Cell: (row) => (
        <div className="text-sm text-gray-500">
          ₹{Number(row.discount_amount || 0).toFixed(2)}
        </div>
      ),
      exportFormat: (row) => `₹${Number(row.discount_amount || 0).toFixed(2)}`
    },
    {
      Header: 'Final Amount',
      accessor: 'final_grand_total',
      Cell: (row) => (
        <div className="font-medium text-gray-900">
          ₹{Number(row.final_grand_total || 0).toFixed(2)}
        </div>
      ),
      exportFormat: (row) => `₹${Number(row.final_grand_total || 0).toFixed(2)}`,
      sortFunction: (a, b, direction) => {
        const aValue = Number(a.final_grand_total || 0);
        const bValue = Number(b.final_grand_total || 0);
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
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
          <option value="parcel">Parcel</option>
          <option value="counter">Counter</option>
          <option value="delivery">Delivery</option>
          <option value="drive-through">Drive Through</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Order Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze order data across your outlet
        </p>
      </div>
      
      <ReportTable
        title="Order Reports"
        columns={columns}
        apiCallback={getOrderReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'created_on', direction: 'desc' }}
      />
    </div>
  );
} 