import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getOrderReport } from '../../api/reports';
import { formatInputDateForAPI, getDateRangeFromType } from '../../utils/dateUtils';

export default function OrderReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterType, setDateFilterType] = useState('all');

  // Function to format snake_case to Title Case
  const formatOrderStatus = (status) => {
    if (!status) return '-';
    
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

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
          <div className="font-medium text-gray-900">{row.customer_name || '-'}</div>
          {row.customer_mobile && <div className="text-xs text-gray-500">{row.customer_mobile}</div>}
        </div>
      ),
      exportFormat: (row) => `${row.customer_name || '-'} ${row.customer_mobile ? `(${row.customer_mobile})` : ''}`
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
          {row.order_type ? row.order_type.replace(/-/g, ' ') : '-'}
        </div>
      )
    },
    {
      Header: 'Order Status',
      accessor: 'order_status',
      Cell: (row) => (
        <div className="text-sm text-gray-700">
          {formatOrderStatus(row.order_status)}
        </div>
      ),
      exportFormat: (row) => formatOrderStatus(row.order_status)
    },
    {
      Header: 'Payment',
      accessor: 'payment_method',
      Cell: (row) => (
        <div className="text-sm text-gray-500 capitalize">
          {row.payment_method ? formatOrderStatus(row.payment_method) : 'N/A'}
        </div>
      ),
      exportFormat: (row) => row.payment_method ? formatOrderStatus(row.payment_method) : 'N/A'
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

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    const { value } = e.target;
    setDateFilterType(value);
    
    // Create a new params object
    const newParams = { ...filterParams };
    
    if (value === 'all') {
      newParams.filter_type = 'all';
      delete newParams.start_date;
      delete newParams.end_date;
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
        const today = new Date();
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

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Home', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Order Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
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