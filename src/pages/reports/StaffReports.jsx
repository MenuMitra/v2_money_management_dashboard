import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
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
            <div className="text-sm capitalize text-gray-700">Active</div>
          );
        } else if (isActive === false) {
          return (
            <div className="text-sm capitalize text-gray-700">Inactive</div>
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
            <div className="text-sm capitalize text-gray-700">Operational</div>
          );
        } else if (type === 'non-operational') {
          return (
            <div className="text-sm capitalize text-gray-700">Non-Operational</div>
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

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Dashboard', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Staff Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
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