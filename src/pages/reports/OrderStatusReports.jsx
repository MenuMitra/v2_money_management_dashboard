import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import DateRangePicker from '../../components/DateRangePicker';
import { getOrderStatusReport } from '../../api/reports';

export default function OrderStatusReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  
  // Handle date range selection
  const handleDateRangeChange = (dateRange) => {
    // Create a new params object
    const newParams = { filter_type: filterParams.filter_type || 'all' };
    
    if (dateRange.type === 'custom') {
      newParams.start_date = dateRange.startDate;
      newParams.end_date = dateRange.endDate;
    } else if (dateRange.type !== 'all') {
      newParams.date_range = dateRange.type;
    }
    
    setFilterParams(newParams);
  };

  // Define columns for the order status report
  const columns = [
    {
      header: 'Order Number',
      accessor: 'order_number',
      Cell: (row) => (
        <div className="font-medium text-gray-900">#{row.order_number || 'N/A'}</div>
      )
    },
    {
      header: 'Order Type',
      accessor: 'order_type',
      Cell: (row) => (
        <div className="capitalize">{row.order_type || 'N/A'}</div>
      )
    },
    {
      header: 'Status',
      accessor: 'order_status',
      Cell: (row) => {
        const status = row.order_status?.toLowerCase();
        if (status === 'completed') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Completed
            </span>
          );
        } else if (status === 'preparing') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Preparing
            </span>
          );
        } else if (status === 'delivering') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              Delivering
            </span>
          );
        } else if (status === 'received') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
              Received
            </span>
          );
        } else if (status === 'cancelled') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
              Cancelled
            </span>
          );
        } else {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              {row.order_status || 'Unknown'}
            </span>
          );
        }
      }
    },
    {
      header: 'Amount',
      accessor: 'amount',
      Cell: (row) => (
        <div className="font-medium text-gray-900">₹{row.amount?.toFixed(2) || '0.00'}</div>
      )
    },
    {
      header: 'Changed By',
      accessor: 'user_name',
      Cell: (row) => (
        <div>{row.user_name || 'N/A'}</div>
      )
    },
    {
      header: 'Changed On',
      accessor: 'changed_on',
      Cell: (row) => (
        <div>{row.changed_on || 'N/A'}</div>
      )
    }
  ];

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Order Status Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track order status changes across your outlet
        </p>
      </div>
      
      <ReportTable
        title="Order Status Reports"
        columns={columns}
        apiCallback={getOrderStatusReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'changed_on', direction: 'desc' }}
      />
    </div>
  );
} 