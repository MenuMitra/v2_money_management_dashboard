import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getSplitTableReport } from '../../api/reports';
import { api, API_PATHS } from '../../api';

export default function SplitTableReports() {
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

  // Define columns for the split table report
  const columns = [
    {
      header: 'Primary Table',
      accessor: 'primary_table_number',
      Cell: (row) => (
        <div className="font-medium text-gray-900">#{row.primary_table_number || 'N/A'}</div>
      )
    },
    {
      header: 'Sub Table',
      accessor: 'sub_table_name',
      Cell: (row) => (
        <div className="font-medium text-gray-900">{row.sub_table_name || 'N/A'}</div>
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
      header: 'Status',
      accessor: 'status',
      Cell: (row) => {
        const status = row.status?.toLowerCase();
        if (status === 'split') {
          return (
            <div className="text-sm capitalize text-gray-700  ">
              {row.status}
            </div>
          );
        } else if (status === 'unsplit') {
          return (
            <div className="text-sm capitalize text-gray-700">
              {row.status}
            </div>
          );
        } else {
          return (
            <div className="text-sm capitalize text-gray-700">
              {row.status || 'Unknown'}
            </div>
          );
        }
      }
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
          className="block w-full rounded-3xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
    { text: 'Split Table Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <ReportTable
        title="Split Table Reports"
        columns={columns}
        apiCallback={getSplitTableReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'changed_on', direction: 'desc' }}
      />
    </div>
  );
} 