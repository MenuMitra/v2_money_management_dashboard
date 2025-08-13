import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getUdhariReport } from '../../api/reports';
import { formatInputDateForAPI, getDateRangeFromType } from '../../utils/dateUtils';

export default function UdhariReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterType, setDateFilterType] = useState('all');
  const [orderType, setOrderType] = useState('all');
  const [ledgerStatus, setLedgerStatus] = useState('all');

  // Function to format snake_case to Title Case
  const formatOrderStatus = (status) => {
    if (!status) return '-';
    
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Define columns for the udhari report
  const columns = [
    {
      header: 'Customer Name',
      accessor: 'customer_name',
      Cell: (row) => (
        <div className="font-medium text-gray-900">{row.customer_name || 'N/A'}</div>
      )
    },
    {
      header: 'Mobile',
      accessor: 'customer_mobile',
      Cell: (row) => (
        <div className="text-sm text-gray-500">{row.customer_mobile || 'N/A'}</div>
      )
    },
    {
      header: 'Address',
      accessor: 'customer_address',
      Cell: (row) => (
        <div className="text-sm text-gray-500 max-w-xs truncate" title={row.customer_address}>
          {row.customer_address || 'N/A'}
        </div>
      )
    },
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
      header: 'Order Status',
      accessor: 'order_status',
      Cell: (row) => (
        <div className="text-sm capitalize text-gray-700">
          {formatOrderStatus(row.order_status) || 'Unknown'}
        </div>
      )
    },
    {
      header: 'Bill Amount',
      accessor: 'bill_amount',
      Cell: (row) => (
        <div className="font-medium text-gray-900">₹{Number(row.bill_amount || 0).toFixed(2)}</div>
      )
    },
    {
      header: 'Udhari Date',
      accessor: 'udhari_datetime',
      Cell: (row) => (
        <div className="text-sm text-gray-500">{row.udhari_datetime || 'N/A'}</div>
      )
    },
    {
      header: 'Settle Amount',
      accessor: 'settle_amount',
      Cell: (row) => (
        <div className="text-sm text-gray-700">₹{Number(row.settle_amount || 0).toFixed(2)}</div>
      )
    },
    {
      header: 'Settle Date',
      accessor: 'settle_datetime',
      Cell: (row) => (
        <div className="text-sm text-gray-500">{row.settle_datetime || 'N/A'}</div>
      )
    },
    {
      header: 'Pending Amount',
      accessor: 'pending_amount',
      Cell: (row) => (
        <div className="font-medium text-red-600">₹{Number(row.pending_amount || 0).toFixed(2)}</div>
      )
    },
    {
      header: 'Ledger Status',
      accessor: 'ledger_status',
      Cell: (row) => {
        const status = row.ledger_status?.toLowerCase();
        let statusClass = 'text-gray-700';
        
        if (status === 'pending') {
          statusClass = 'text-red-600';
        } else if (status === 'partial_settled') {
          statusClass = 'text-yellow-600';
        } else if (status === 'settled') {
          statusClass = 'text-green-600';
        }
        
        return (
          <div className={`text-sm capitalize font-medium ${statusClass}`}>
            {formatOrderStatus(row.ledger_status) || 'Unknown'}
          </div>
        );
      }
    },
    {
      header: 'Est. Settlement',
      accessor: 'estimated_settlement_period',
      Cell: (row) => (
        <div className="text-sm text-gray-500">{row.estimated_settlement_period || 'N/A'}</div>
      )
    }
  ];

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    const { value } = e.target;
    setDateFilterType(value);
    
    // Create a new params object
    const newParams = { ...filterParams };
    
    if (value === 'all') {
      delete newParams.start_date;
      delete newParams.end_date;
      // Keep other filters intact
      if (orderType !== 'all') {
        newParams.filter_type = 'order_type';
        newParams.order_type = orderType;
      } else if (ledgerStatus !== 'all') {
        newParams.filter_type = 'ledger_status';
        newParams.ledger_status = ledgerStatus;
      } else {
        newParams.filter_type = 'all';
      }
    } else if (value === 'custom') {
      if (startDate && endDate) {
        newParams.filter_type = 'date_range';
        newParams.start_date = formatInputDateForAPI(startDate);
        newParams.end_date = formatInputDateForAPI(endDate);
      }
    } else {
      // For predefined date ranges, use the utility function
      const { startDate: calculatedStart, endDate: calculatedEnd } = getDateRangeFromType(value);
      
      if (calculatedStart && calculatedEnd) {
        // Store the HTML input format dates (YYYY-MM-DD) in state
        const formatDateForInput = (date) => {
          if (typeof date === 'string' && date.includes(' ')) {
            // Convert from DD MMM YYYY to input format
            const [day, month, year] = date.split(' ');
            const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
            if (monthIndex !== -1) {
              const dateObj = new Date(parseInt(year), monthIndex, parseInt(day));
              return dateObj.toISOString().split('T')[0];
            }
          }
          return '';
        };
        
        setStartDate(formatDateForInput(calculatedStart));
        setEndDate(formatDateForInput(calculatedEnd));
        
        // Use the API format dates (DD MMM YYYY) in the params
        newParams.filter_type = 'date_range';
        newParams.start_date = calculatedStart;
        newParams.end_date = calculatedEnd;
      }
    }
    
    setFilterParams(newParams);
  };
  
  // Handle date input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
    
    // If both dates are set and custom filter is selected, update params
    if (dateFilterType === 'custom' && 
        ((name === 'startDate' && value && endDate) || 
         (name === 'endDate' && value && startDate))) {
      
      const newStartDate = name === 'startDate' ? value : startDate;
      const newEndDate = name === 'endDate' ? value : endDate;
      
      const newParams = { ...filterParams };
      newParams.filter_type = 'date_range';
      newParams.start_date = formatInputDateForAPI(newStartDate);
      newParams.end_date = formatInputDateForAPI(newEndDate);
      setFilterParams(newParams);
    }
  };

  // Handle order type filter change
  const handleOrderTypeChange = (e) => {
    const selectedOrderType = e.target.value;
    setOrderType(selectedOrderType);
    
    const newParams = { ...filterParams };
    
    if (selectedOrderType === 'all') {
      delete newParams.order_type;
      // Check if we have other filters
      if (ledgerStatus !== 'all') {
        newParams.filter_type = 'ledger_status';
        newParams.ledger_status = ledgerStatus;
      } else if (dateFilterType !== 'all') {
        // Keep date filter if it exists
        if (dateFilterType === 'custom' && startDate && endDate) {
          newParams.filter_type = 'date_range';
          newParams.start_date = formatInputDateForAPI(startDate);
          newParams.end_date = formatInputDateForAPI(endDate);
        } else if (dateFilterType !== 'custom') {
          const { startDate: calculatedStart, endDate: calculatedEnd } = getDateRangeFromType(dateFilterType);
          if (calculatedStart && calculatedEnd) {
            newParams.filter_type = 'date_range';
            newParams.start_date = calculatedStart;
            newParams.end_date = calculatedEnd;
          }
        }
      } else {
        newParams.filter_type = 'all';
      }
    } else {
      newParams.filter_type = 'order_type';
      newParams.order_type = selectedOrderType;
    }
    
    setFilterParams(newParams);
  };

  // Handle ledger status filter change
  const handleLedgerStatusChange = (e) => {
    const selectedStatus = e.target.value;
    setLedgerStatus(selectedStatus);
    
    const newParams = { ...filterParams };
    
    if (selectedStatus === 'all') {
      delete newParams.ledger_status;
      // Check if we have other filters
      if (orderType !== 'all') {
        newParams.filter_type = 'order_type';
        newParams.order_type = orderType;
      } else if (dateFilterType !== 'all') {
        // Keep date filter if it exists
        if (dateFilterType === 'custom' && startDate && endDate) {
          newParams.filter_type = 'date_range';
          newParams.start_date = formatInputDateForAPI(startDate);
          newParams.end_date = formatInputDateForAPI(endDate);
        } else if (dateFilterType !== 'custom') {
          const { startDate: calculatedStart, endDate: calculatedEnd } = getDateRangeFromType(dateFilterType);
          if (calculatedStart && calculatedEnd) {
            newParams.filter_type = 'date_range';
            newParams.start_date = calculatedStart;
            newParams.end_date = calculatedEnd;
          }
        }
      } else {
        newParams.filter_type = 'all';
      }
    } else {
      newParams.filter_type = 'ledger_status';
      newParams.ledger_status = selectedStatus;
    }
    
    setFilterParams(newParams);
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={dateFilterType}
          onChange={handleDateFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Range</option>
        </select>
        
        {dateFilterType === 'custom' && (
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
          </div>
        )}
      </div>
      
      <div>
        <select
          value={orderType}
          onChange={handleOrderTypeChange}
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

      <div>
        <select
          value={ledgerStatus}
          onChange={handleLedgerStatusChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="partial_settled">Partial Settled</option>
          <option value="settled">Settled</option>
        </select>
      </div>
    </div>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Home', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Udhari Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <ReportTable
        title="Udhari Reports"
        columns={columns}
        apiCallback={getUdhariReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'udhari_datetime', direction: 'desc' }}
      />
    </div>
  );
} 