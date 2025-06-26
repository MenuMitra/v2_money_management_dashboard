import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import DateRangePicker from '../../components/DateRangePicker';
import { getJoinTableReport } from '../../api/reports';
import { api, API_PATHS } from '../../api';

export default function JoinTableReports() {
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
      const response = await api.get(API_PATHS.reportFilterSection);
      
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

  // Define columns for the join table report
  const columns = [
    {
      header: 'Primary Table',
      accessor: 'primary_table_number',
      Cell: (row) => (
        <div className="font-medium text-gray-900">#{row.primary_table_number || 'N/A'}</div>
      )
    },
    {
      header: 'Joined Table',
      accessor: 'joined_table_number',
      Cell: (row) => (
        <div className="font-medium text-gray-900">#{row.joined_table_number || 'N/A'}</div>
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
        if (status === 'joined') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Joined
            </span>
          );
        } else if (status === 'separated') {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              Separated
            </span>
          );
        } else {
          return (
            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              {row.status || 'Unknown'}
            </span>
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
    
    // Keep section_id if it exists
    if (filterParams.section_id) {
      newParams.section_id = filterParams.section_id;
    }
    
    setFilterParams(newParams);
  };

  // Handle section filter change
  const handleSectionChange = (e) => {
    const sectionId = e.target.value;
    
    if (sectionId) {
      setFilterParams(prev => ({
        ...prev,
        filter_type: 'section',
        section_id: parseInt(sectionId, 10)
      }));
    } else {
      // If no section is selected, remove section_id and set filter_type to 'all'
      const { section_id, ...rest } = filterParams;
      setFilterParams({
        ...rest,
        filter_type: 'all'
      });
    }
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <DateRangePicker onChange={handleDateRangeChange} />
      </div>
      
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

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Join Table Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track table joining operations across your outlet
        </p>
      </div>
      
      <ReportTable
        title="Join Table Reports"
        columns={columns}
        apiCallback={getJoinTableReport}
        filterParams={filterParams}
        filterComponent={renderFilters()}
        initialSortConfig={{ key: 'changed_on', direction: 'desc' }}
      />
    </div>
  );
} 