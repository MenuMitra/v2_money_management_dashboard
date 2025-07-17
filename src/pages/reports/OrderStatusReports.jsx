import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getOrderStatusReport } from '../../api/reports';
import { formatInputDateForAPI } from '../../utils/dateUtils';

export default function OrderStatusReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Handle date input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
    
    updateFilterParams(name === 'startDate' ? value : startDate, name === 'endDate' ? value : endDate);
  };
  
  // Update filter parameters based on date inputs
  const updateFilterParams = (start, end) => {
    const newParams = { filter_type: 'all' };
    
    // If either start or end date is provided, switch to date_range filter
    if (start || end) {
      newParams.filter_type = 'date_range';
      
      if (start) {
        newParams.start_date = formatInputDateForAPI(start);
      }
      
      if (end) {
        newParams.end_date = formatInputDateForAPI(end);
      }
    }
    
    setFilterParams(newParams);
  };
  
  // Clear date filters
  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
    setFilterParams({
      filter_type: 'all'
    });
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
      <div className="flex flex-wrap gap-2 items-center">
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
          {(startDate || endDate) && (
            <button
              onClick={handleClearDates}
              className="ml-2 px-2 py-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Home', url: '/' },
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