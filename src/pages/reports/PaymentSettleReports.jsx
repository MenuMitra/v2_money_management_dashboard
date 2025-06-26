import { useState } from 'react';
import { ReportTable } from '../../components/common';
import DateRangePicker from '../../components/DateRangePicker';
import { getPaymentSettleReport } from '../../api/reports';

export default function PaymentSettleReports() {
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
      <div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Settlement Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track payment settlement changes across your outlet
        </p>
      </div>
      
      <ReportTable
        title="Payment Settlement Reports"
        columns={columns}
        apiCallback={getPaymentSettleReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'changed_on', direction: 'desc' }}
      />
    </div>
  );
} 