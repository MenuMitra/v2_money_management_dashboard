import { useState } from 'react';
import { ReportTable } from '../../components/common';
import DateRangePicker from '../../components/DateRangePicker';
import { getStaffReport } from '../../api/reports';

export default function StaffReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  
  // Define columns for the operational staff
  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      Cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      Cell: (row) => (
        <div className="capitalize">{row.role || 'N/A'}</div>
      )
    },
    {
      header: 'Mobile',
      accessor: 'mobile',
      Cell: (row) => row.mobile || 'N/A'
    },
    {
      header: 'Email',
      accessor: 'email',
      Cell: (row) => row.email || 'N/A'
    },
    {
      header: 'Address',
      accessor: 'address',
      Cell: (row) => row.address || 'N/A'
    },
    {
      header: 'Status',
      accessor: 'is_active',
      Cell: (row) => {
        const isActive = row.is_active;
        
        if (isActive === true) {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Active
            </span>
          );
        } else if (isActive === false) {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
              Inactive
            </span>
          );
        }
        
        return 'N/A';
      }
    },
    {
      header: 'Last Login',
      accessor: 'last_login',
      Cell: (row) => row.last_login || 'N/A'
    },
    {
      header: 'Staff Type',
      accessor: 'type',
      Cell: (row) => {
        const type = row.type;
        
        if (type === 'operational') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
              Operational
            </span>
          );
        } else if (type === 'non-operational') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
              Non-Operational
            </span>
          );
        }
        
        return 'N/A';
      }
    }
  ];

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

  // Handle staff type filter change
  const handleStaffTypeChange = (e) => {
    const value = e.target.value;
    
    setFilterParams(prev => ({
      ...prev,
      filter_type: value
    }));
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>
      
      <div>
        <select
          value={filterParams.filter_type || 'all'}
          onChange={handleStaffTypeChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="all">All Staff</option>
          <option value="operational">Operational Staff</option>
          <option value="non-operational">Non-Operational Staff</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Staff Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and analyze staff data across your outlet
        </p>
      </div>
      
      <ReportTable
        title="Staff Reports"
        columns={columns}
        apiCallback={getStaffReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'name', direction: 'asc' }}
      />
    </div>
  );
} 