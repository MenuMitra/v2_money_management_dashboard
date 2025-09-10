import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getMenuReport } from '../../api/reports';
import { api, API_PATHS } from '../../api';
import { formatInputDateForAPI, getDateRangeFromType } from '../../utils/dateUtils';

export default function MenuReports() {
  // Initialize with minimal required parameters
  const [filterParams, setFilterParams] = useState({
    filter_type: 'all'
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterType, setDateFilterType] = useState('all');
  
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
      
      // Use POST method instead of GET
      const outletId = localStorage.getItem('outlet_id');
      const userId = localStorage.getItem('user_id');
      
      const requestBody = {
        outlet_id: outletId ? parseInt(outletId, 10) : null,
        user_id: userId ? parseInt(userId, 10) : null,
        app_source: 'admin'
      };
      
      const response = await api.post(API_PATHS.reportFilterCategory, requestBody);
      
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

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    const { value } = e.target;
    setDateFilterType(value);
    
    // Create a new params object
    const newParams = { ...filterParams };
    
    if (value === 'all') {
      newParams.filter_type = 'all';
      delete newParams.start_date;
      delete newParams.end_date;
    } else if (value === 'custom') {
      if (startDate && endDate) {
        newParams.filter_type = 'date_range';
        newParams.start_date = formatInputDateForAPI(startDate);
        newParams.end_date = formatInputDateForAPI(endDate);
      }
    } else {
      // For predefined date ranges, use the utility function
      const { startDate: calculatedStart, endDate: calculatedEnd } = getDateRangeFromType(value);
      
      if (calculatedStart && calculatedEnd) {
        // Store the HTML input format dates (YYYY-MM-DD) in state
        const formatDateForInput = (date) => {
          if (typeof date === 'string' && date.includes(' ')) {
            // Convert from DD MMM YYYY to input format
            const [day, month, year] = date.split(' ');
            const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(month);
            if (monthIndex !== -1) {
              const dateObj = new Date(parseInt(year), monthIndex, parseInt(day));
              return dateObj.toISOString().split('T')[0];
            }
          }
          return '';
        };
        
        setStartDate(formatDateForInput(calculatedStart));
        setEndDate(formatDateForInput(calculatedEnd));
        
        // Use the API format dates (DD MMM YYYY) in the params
        newParams.filter_type = 'date_range';
        newParams.start_date = calculatedStart;
        newParams.end_date = calculatedEnd;
      }
    }
    
    // Preserve any category filter if it exists
    if (filterParams.category_id && filterParams.category_id !== 'all') {
      newParams.category_id = parseInt(filterParams.category_id, 10);
    }
    
    setFilterParams(newParams);
  };
  
  // Handle date input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
    
    // If both dates are set and custom filter is selected, update params
    if (dateFilterType === 'custom' && 
        ((name === 'startDate' && value && endDate) || 
         (name === 'endDate' && value && startDate))) {
      
      const newStartDate = name === 'startDate' ? value : startDate;
      const newEndDate = name === 'endDate' ? value : endDate;
      
      const newParams = { ...filterParams };
      newParams.filter_type = 'date_range';
      newParams.start_date = formatInputDateForAPI(newStartDate);
      newParams.end_date = formatInputDateForAPI(newEndDate);
      
      // Preserve any category filter if it exists
      if (filterParams.category_id && filterParams.category_id !== 'all') {
        newParams.category_id = parseInt(filterParams.category_id, 10);
      }
      
      setFilterParams(newParams);
    }
  };

  // Handle category filter change - FIXED THIS FUNCTION
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category_id') {
      // Create a new filterParams object with the updated category
      const newParams = {
        ...filterParams,
        category_id: value === 'all' ? undefined : parseInt(value, 10)
      };
      
      // Remove the category_id property if it's undefined
      if (newParams.category_id === undefined) {
        delete newParams.category_id;
      }
      
      setFilterParams(newParams);
    }
  };

  // Render filter components
  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={dateFilterType}
          onChange={handleDateFilterChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
          </div>
        )}
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
    { text: 'Home', url: '/' },
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