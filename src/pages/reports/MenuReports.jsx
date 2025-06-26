import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import DateRangePicker from '../../components/DateRangePicker';
import { getMenuReport } from '../../api/reports';
import { api, API_PATHS } from '../../api';

export default function MenuReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  
  // State for categories
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories from the API
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError(null);
      
      // Use the correct API endpoint with GET method
      const response = await api.get(API_PATHS.reportFilterCategory);
      
      if (response.data && response.data.detail && Array.isArray(response.data.detail)) {
        setCategories(response.data.detail);
      } else {
        console.error('Unexpected category API response format:', response.data);
        setError('Failed to load categories properly');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Define columns for the report table with proper widths
  const columns = [
    {
      Header: 'Menu Name',
      accessor: 'menu_name',
      minWidth: 200,
      Cell: (row) => (
        <div className="font-medium text-gray-900 whitespace-nowrap">
          {row.menu_name}
        </div>
      )
    },
    {
      Header: 'Category',
      accessor: 'category_name',
      minWidth: 150,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.category_name || 'Uncategorized'}
        </div>
      )
    },
    {
      Header: 'Description',
      accessor: 'description',
      minWidth: 250,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.description || '-'}
        </div>
      )
    },
    {
      Header: 'Status',
      accessor: 'is_available',
      minWidth: 120,
      Cell: (row) => (
        <div className="text-sm text-gray-500 whitespace-nowrap">
          {row.is_available ? 'Available' : 'Unavailable'}
        </div>
      ),
      sortFunction: (a, b, direction) => {
        const aValue = a.is_available ? 1 : 0;
        const bValue = b.is_available ? 1 : 0;
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
    },
    {
      Header: 'Portions',
      accessor: 'portions',
      minWidth: 300,
      Cell: (row) => {
        if (!row.portions || row.portions.length === 0) {
          return <div className="text-sm text-gray-500 whitespace-nowrap">No portions</div>;
        }
        
        return (
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {row.portions.map((portion, index) => (
              <span key={portion.portion_id || index}>
                {portion.portion_name}: ₹{portion.price}
                {portion.is_available ? ' (Available)' : ' (Unavailable)'}
                {index < row.portions.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </div>
        );
      },
      exportFormat: (row) => {
        if (!row.portions || row.portions.length === 0) return 'No portions';
        return row.portions.map(p => `${p.portion_name} (₹${p.price})`).join(', ');
      }
    }
  ];

  // Handle date range selection
  const handleDateRangeChange = (dateRange) => {
    // Create a new params object
    const newParams = { filter_type: 'all' };
    
    if (dateRange.type === 'custom') {
      newParams.filter_type = 'date_range';
      newParams.start_date = dateRange.startDate;
      newParams.end_date = dateRange.endDate;
    } else if (dateRange.type !== 'all') {
      newParams.filter_type = 'date_range';
      newParams.date_range = dateRange.type;
    }
    
    // Preserve any category filter if it exists
    if (filterParams.category_id && filterParams.category_id !== 'all') {
      newParams.category_id = parseInt(filterParams.category_id, 10);
    }
    
    setFilterParams(newParams);
  };

  // Handle category filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category_id') {
      const newParams = { ...filterParams };
      
      if (value === 'all') {
        // Remove category_id if "all" is selected
        delete newParams.category_id;
      } else {
        // Add the category_id if a specific category is selected
        // Convert to integer as the API expects numeric values
        newParams.category_id = parseInt(value, 10);
      }
      
      setFilterParams(newParams);
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
          name="category_id"
          value={filterParams.category_id || 'all'}
          onChange={handleFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          disabled={loadingCategories}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.category_id} value={category.category_id}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Dashboard', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Menu Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <ReportTable
            title="Menu Reports"
            columns={columns}
            apiCallback={getMenuReport}
            filterParams={filterParams}
            filterComponent={renderFilters()}
            initialSortConfig={{ key: 'menu_name', direction: 'asc' }}
          />
        </div>
      </div>
    </div>
  );
} 