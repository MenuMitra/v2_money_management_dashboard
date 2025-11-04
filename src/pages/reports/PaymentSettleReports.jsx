import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getPaymentSettleReport } from '../../api/reports';
import { formatInputDateForAPI } from '../../utils/dateUtils';

export default function PaymentSettleReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [resetKey, setResetKey] = useState(0); // Add resetKey state

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
    // Require both dates to form a valid range
    if (start && end) {
      newParams.filter_type = 'date_range';
      newParams.start_date = formatInputDateForAPI(start);
      newParams.end_date = formatInputDateForAPI(end);
    }
    setFilterParams(newParams);
  };
  
  // Clear date filters and reset report data
  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
    setFilterParams({
      filter_type: 'all'
    });
    setResetKey(prev => prev + 1); // Increment resetKey to force ReportTable reset
  };

  // Define columns for the payment settle report
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
      header: 'Previous Settle Type',
      accessor: 'previous_settle_type',
      Cell: (row) => {
        const settleType = row.previous_settle_type?.toLowerCase();
        return (
          <div className="capitalize">
            {settleType === 'null' ? 'None' : (row.previous_settle_type || 'None')}
          </div>
        );
      }
    },
    {
      header: 'New Settle Type',
      accessor: 'new_settle_type',
      Cell: (row) => (
        <div className="capitalize">{row.new_settle_type || 'N/A'}</div>
      )
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
      accessor: 'changed_by',
      Cell: (row) => (
        <div>{row.changed_by || 'N/A'}</div>
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
    { text: 'Payment Settlement Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <ReportTable
        key={resetKey} // Add key prop to force re-render on reset
        title="Payment Settlement Reports"
        columns={columns}
        apiCallback={getPaymentSettleReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'changed_on', direction: 'desc' }}
        generateDisabled={!(startDate && endDate)}
        generateDisabledMessage={!(startDate && endDate) ? 'Select date range' : ''}
      />
    </div>
  );
}