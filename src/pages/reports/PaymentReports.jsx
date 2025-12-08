import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getPaymentReport } from '../../api/reports';
import { formatInputDateForAPI, getDateRangeFromType } from '../../utils/dateUtils';

export default function PaymentReports() {
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterType, setDateFilterType] = useState('all');

  const formatPaymentStatus = (status) => {
    if (!status) return '-';
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';
    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const columns = [
    {
      Header: 'Order No',
      accessor: 'order_number',
      Cell: (row) => (
        <div className="font-medium text-gray-900">
          #{row.order_number || '-'}
        </div>
      ),
      exportFormat: (row) => `#${row.order_number || '-'}`,
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
      exportFormat: (row) => `${row.customer_name || '-'} ${row.customer_mobile ? `(${row.customer_mobile})` : ''}`,
    },
    {
      Header: 'Order Type',
      accessor: 'order_type',
      Cell: (row) => (
        <div className="text-sm capitalize">
          {row.order_type ? row.order_type.replace(/-/g, ' ') : '-'}
        </div>
      ),
      exportFormat: (row) => (row.order_type ? row.order_type.replace(/-/g, ' ') : '-'),
    },
    {
      Header: 'Payment Date',
      accessor: 'created_on',
      Cell: (row) => (
        <div className="text-sm text-gray-500">
          {row.created_on || '-'}
        </div>
      ),
    },
    {
      Header: 'Payment Method',
      accessor: 'payment_method',
      Cell: (row) => (
        <div className="text-sm capitalize">
          {formatPaymentMethod(row.payment_method)}
        </div>
      ),
      exportFormat: (row) => formatPaymentMethod(row.payment_method),
    },
    {
      Header: 'Order Status',
      accessor: 'order_status',
      Cell: (row) => (
        <div className="text-sm text-gray-700">
          {formatPaymentStatus(row.order_status)}
        </div>
      ),
      exportFormat: (row) => formatPaymentStatus(row.order_status),
    },
    {
      Header: 'Amount',
      accessor: 'final_grand_total',
      Cell: (row) => (
        <div className="text-sm font-bold text-gray-900">
          ₹{Number(row.final_grand_total || 0).toFixed(2)}
        </div>
      ),
      exportFormat: (row) => `₹${Number(row.final_grand_total || 0).toFixed(2)}`,
    },
  ];

  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setDateFilterType(value);

    if (value === 'custom') {
      return;
    }

    setStartDate('');
    setEndDate('');

    const newParams = { ...filterParams };

    if (value === 'all') {
      delete newParams.start_date;
      delete newParams.end_date;
    } else {
      const { startDate: rangeStartDate, endDate: rangeEndDate } = getDateRangeFromType(value);
      newParams.start_date = rangeStartDate;
      newParams.end_date = rangeEndDate;
    }

    console.log('Updated filterParams:', newParams); // Debugging log
    setFilterParams(newParams);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      if (startDate && value < startDate) {
        // Optionally show an error or reset endDate
        return;
      }
      setEndDate(value);
    }

    const newParams = { ...filterParams };
    if (name === 'startDate') {
      newParams.start_date = formatInputDateForAPI(value);
    } else if (name === 'endDate') {
      newParams.end_date = formatInputDateForAPI(value);
    }

    if (dateFilterType === 'custom' && startDate && (name === 'endDate' ? value : endDate)) {
      console.log('Updated filterParams for custom range:', newParams); // Debugging log
      setFilterParams(newParams);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === 'payment_method') {
      const newParams = { ...filterParams };

      if (value === 'all') {
        delete newParams.payment_method;
      } else {
        newParams.payment_method = value;
      }

      setFilterParams(newParams);
    }
  };

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={dateFilterType}
          onChange={handleDateFilterChange}
          className="block w-full rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
              className="block rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
          name="payment_method"
          value={filterParams.payment_method || 'all'}
          onChange={handleFilterChange}
          className="block w-full rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Payment Methods</option>
          <option value="upi">UPI</option>
          <option value="gpay">GPay</option>
          <option value="phonepay">PhonePe</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="advance_payment">Advance Payment</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
    </div>
  );

  const breadcrumbItems = [
    { text: 'Home', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Payment Reports' },
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <ReportTable
        title="Payment Reports"
        columns={columns}
        apiCallback={getPaymentReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'created_on', direction: 'desc' }}
      />
    </div>
  );
}