import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
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
            <div className="text-sm capitalize text-gray-700">
              {row.order_status}
            </div>
          );
        } else if (status === 'preparing') {
          return (
            <div className="text-sm capitalize text-gray-700">
              {row.order_status}
            </div>
          );
        } else if (status === 'delivering') {
          return (
            <div className="text-sm capitalize text-gray-700">
              {row.order_status}
            </div>
          );
        } else if (status === 'received') {
          return (
            <div className="text-sm capitalize text-gray-700">
              {row.order_status}
            </div>
          );
        } else if (status === 'cancelled') {
          return (
            <div className="text-sm capitalize text-gray-700">
              {row.order_status}
            </div>
          );
        } else {
          return (
            <div className="text-sm capitalize text-gray-700">
              {row.order_status || 'Unknown'}
            </div>
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

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Dashboard', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Order Status Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
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