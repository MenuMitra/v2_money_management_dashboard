import { useState } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getStaffReport } from '../../api/reports';

export default function StaffReports() {
  const capitalizeWords = (value) => {
    if (!value || typeof value !== 'string') return 'N/A';
    return value
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  
  // Define columns for the operational staff
  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
      Cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{capitalizeWords(row.name)}</div>
        </div>
      ),
      exportFormat: (row) => capitalizeWords(row.name)
    },
    {
      Header: 'Role',
      accessor: 'role',
      Cell: (row) => (
        <div className="capitalize">{row.role || 'N/A'}</div>
      ),
      exportFormat: (row) => capitalizeWords(row.role)
    },
    {
      Header: 'Mobile',
      accessor: 'mobile',
      Cell: (row) => row.mobile || 'N/A'
    },
    {
      Header: 'Email',
      accessor: 'email',
      Cell: (row) => row.email || 'N/A',
      exportFormat: (row) => capitalizeWords(row.email)
    },
    {
      Header: 'Address',
      accessor: 'address',
      Cell: (row) => row.address || 'N/A',
      exportFormat: (row) => capitalizeWords(row.address)
    },
    {
      Header: 'Status',
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
      },
      exportFormat: (row) => {
        if (row.is_active === true) return 'Active';
        if (row.is_active === false) return 'Inactive';
        return 'N/A';
      }
    },
    {
      Header: 'Last Login',
      accessor: 'last_login',
      Cell: (row) => row.last_login || 'N/A',
      exportFormat: (row) => row.last_login || 'N/A'
    },
    {
      Header: 'Staff Type',
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
      },
      exportFormat: (row) => {
        const type = row.type;
        if (type === 'operational') return 'Operational';
        if (type === 'non-operational') return 'Non-Operational';
        return 'N/A';
      }
    }
  ];

  // Handle staff type filter change
  const handleStaffTypeChange = (e) => {
    const value = e.target.value;
    
    setFilterParams({
      filter_type: value,
    });
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <select
          value={filterParams.filter_type || 'all'}
          onChange={handleStaffTypeChange}
          className="block w-full rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
    { text: 'Home', url: '/' },
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