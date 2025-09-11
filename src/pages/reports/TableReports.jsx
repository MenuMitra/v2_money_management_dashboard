import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getTableReport } from '../../api/reports';
import { api, API_PATHS } from '../../api';

export default function TableReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sections when component mounts
  useEffect(() => {
    fetchSections();
  }, []);

  // Function to fetch sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.post(API_PATHS.reportFilterSection, {
        outlet_id: localStorage.getItem('outlet_id'),
        user_id: localStorage.getItem('user_id'),
        app_source: "api"
      });
      
      if (response.data && response.data.detail) {
        setSections(response.data.detail);
      } else {
        console.error('Unexpected API response format:', response.data);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
      setError('Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  // Define columns for the table report
  const columns = [
    {
      header: 'Table Number',
      accessor: 'table_number',
      Cell: (row) => (
        <div className="font-medium text-gray-900">#{row.table_number || 'N/A'}</div>
      )
    },
    {
      header: 'Section',
      accessor: 'section_name',
      Cell: (row) => (
        <div className="capitalize">{row.section_name || 'N/A'}</div>
      )
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
      Cell: (row) => (
        <div>{row.capacity || 0} persons</div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      Cell: (row) => {
        if (row.is_reserved) {
          return (
            <div className="text-sm capitalize text-gray-700">Reserved</div>
          );
        } else if (row.is_joined && row.current_order) {
          return (
            <div className="text-sm capitalize text-gray-700">Occupied</div>
          );
        } else {
          return (
            <div className="text-sm capitalize text-gray-700">Available</div>
          );
        }
      }
    },
    {
      header: 'Current Order',
      accessor: 'current_order',
      Cell: (row) => {
        if (row.current_order) {
          return (
            <div>
              <div className="font-medium">{row.current_order.order_number}</div>
              <div className="text-xs text-gray-500">{row.current_order.order_status}</div>
            </div>
          );
        }
        return <div className="text-gray-500">No active order</div>;
      }
    },
    {
      header: 'Reserved',
      accessor: 'is_reserved',
      Cell: (row) => (
        <div>{row.is_reserved ? 'Yes' : 'No'}</div>
      )
    },
    {
      header: 'Joined',
      accessor: 'is_joined',
      Cell: (row) => (
        <div>{row.is_joined ? 'Yes' : 'No'}</div>
      )
    }
  ];

  // Handle section filter change
  const handleSectionChange = (e) => {
    const sectionId = e.target.value;
    
    if (sectionId) {
      setFilterParams({
        filter_type: 'section',
        section_id: parseInt(sectionId, 10)
      });
    } else {
      setFilterParams({
        filter_type: 'all'
      });
    }
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <select
          value={filterParams.section_id || ''}
          onChange={handleSectionChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={loading}
        >
          <option value="">All Sections</option>
          {sections.map(section => (
            <option key={section.section_id} value={section.section_id}>
              {section.section_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Home', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Table Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <ReportTable
        title="Table Reports"
        columns={columns}
        apiCallback={getTableReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'table_number', direction: 'asc' }}
      />
    </div>
  );
} 