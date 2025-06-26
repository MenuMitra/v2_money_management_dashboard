import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import DateRangePicker from '../../components/DateRangePicker';
import { getCouponReport } from '../../api/reports';

export default function CouponReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [orderType, setOrderType] = useState('all');
  
  // Handle date range selection
  const handleDateRangeChange = (dateRange) => {
    // Create a new params object
    const newParams = { filter_type: filterParams.filter_type };
    
    if (dateRange.type === 'custom') {
      newParams.start_date = dateRange.startDate;
      newParams.end_date = dateRange.endDate;
    } else if (dateRange.type !== 'all') {
      newParams.date_range = dateRange.type;
    }
    
    setFilterParams(newParams);
  };

  // Handle order type filter change
  const handleOrderTypeChange = (e) => {
    const selectedOrderType = e.target.value;
    setOrderType(selectedOrderType);
    
    if (selectedOrderType === 'all') {
      setFilterParams(prev => ({
        ...prev,
        filter_type: 'all'
      }));
    } else {
      setFilterParams(prev => ({
        ...prev,
        filter_type: 'order_type',
        order_type: selectedOrderType
      }));
    }
  };

  // Define columns for the coupon report
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
      header: 'Coupon Code',
      accessor: 'coupon_code',
      Cell: (row) => (
        <div className="font-medium text-gray-900">{row.coupon_code || 'N/A'}</div>
      )
    },
    {
      header: 'Coupon Type',
      accessor: 'coupon_type',
      Cell: (row) => (
        <div className="capitalize">{row.coupon_type || 'N/A'}</div>
      )
    },
    {
      header: 'Discount',
      accessor: 'discount_amount',
      Cell: (row) => (
        <div className="font-medium text-gray-900">₹{row.discount_amount?.toFixed(2) || '0.00'}</div>
      )
    },
    {
      header: 'Bill Amount',
      accessor: 'total_bill_amount',
      Cell: (row) => (
        <div>₹{row.total_bill_amount?.toFixed(2) || '0.00'}</div>
      )
    },
    {
      header: 'Final Amount',
      accessor: 'final_grand_total',
      Cell: (row) => (
        <div className="font-medium text-gray-900">₹{row.final_grand_total?.toFixed(2) || '0.00'}</div>
      )
    }
  ];

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>
      
      <div>
        <select
          value={orderType}
          onChange={handleOrderTypeChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Orders</option>
          <option value="dine-in">Dine-in</option>
          <option value="parcel">Parcel</option>
          <option value="counter">Counter</option>
          <option value="delivery">Delivery</option>
          <option value="drive-through">Drive-through</option>
        </select>
      </div>
    </div>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Dashboard', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Coupon Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <ReportTable
        title="Coupon Reports"
        columns={columns}
        apiCallback={getCouponReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'order_number', direction: 'desc' }}
      />
    </div>
  );
} 