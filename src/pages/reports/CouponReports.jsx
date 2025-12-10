import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getCouponReport } from '../../api/reports';

export default function CouponReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [orderType, setOrderType] = useState('all');
  
  // Handle order type filter change
  const handleOrderTypeChange = (e) => {
    const selectedOrderType = e.target.value;
    setOrderType(selectedOrderType);
    
    if (selectedOrderType === 'all') {
      setFilterParams({
        filter_type: 'all'
      });
    } else {
      setFilterParams({
        filter_type: 'order_type',
        order_type: selectedOrderType
      });
    }
  };

// Define columns for the coupon report
const columns = [
  {
    Header: 'Order Number',
    accessor: 'order_number',
    Cell: (row) => (
      <div className="font-medium text-gray-900">#{row.order_number || 'N/A'}</div>
    )
  },
  {
    Header: 'Order Type',
    accessor: 'order_type',
    Cell: (row) => (
      <div className="capitalize">{row.order_type || 'N/A'}</div>
    )
  },
  {
    Header: 'Status',
    accessor: 'order_status',
    Cell: (row) => {
      const status = row.order_status
        ? row.order_status.charAt(0).toUpperCase() + row.order_status.slice(1).toLowerCase()
        : 'Unknown';
      return (
        <div className="text-sm text-gray-700">{status}</div>
      );
    }
  },
  {
    Header: 'Coupon Code',
    accessor: 'coupon_code',
    Cell: (row) => (
      <div className="font-medium text-gray-900">{row.coupon_code || 'N/A'}</div>
    )
  },
  {
    Header: 'Coupon Type',
    accessor: 'coupon_type',
    Cell: (row) => (
      <div className="capitalize">{row.coupon_type || 'N/A'}</div>
    )
  },
  {
    Header: 'Discount',
    accessor: 'discount_amount',
    Cell: (row) => {
      const discount = (row.total_bill_amount || 0) - (row.final_grand_total || 0);
      return (
        <div className="font-medium text-gray-900">Rs {discount.toFixed(2)}</div>
      );
    },
    exportFormat: (row) => {
      const discount = (row.total_bill_amount || 0) - (row.final_grand_total || 0);
      return `Rs ${discount.toFixed(2)}`;
    }
  },
  {
    Header: 'Bill Amount',
    accessor: 'total_bill_amount',
    Cell: (row) => (
      <div>Rs {(row.total_bill_amount ?? 0).toFixed(2)}</div>
    ),
    exportFormat: (row) => `Rs ${(row.total_bill_amount ?? 0).toFixed(2)}`
  },
  {
    Header: 'Final Amount',
    accessor: 'final_grand_total',
    Cell: (row) => (
      <div className="font-medium text-gray-900">Rs {(row.final_grand_total ?? 0).toFixed(2)}</div>
    ),
    exportFormat: (row) => `Rs ${(row.final_grand_total ?? 0).toFixed(2)}`
  }
];

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <select
          value={orderType}
          onChange={handleOrderTypeChange}
          className="block w-full rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
    { text: 'Home', url: '/' },
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


