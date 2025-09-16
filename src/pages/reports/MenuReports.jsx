import { useState, useEffect } from 'react';
import { ReportTable } from '../../components/common';
import { Breadcrumb } from '../../components';
import { getMenuReport } from '../../api/reports';
import { api, API_PATHS } from '../../api';
import { formatInputDateForAPI, getDateRangeFromType } from '../../utils/dateUtils';

// ---------- Description Cell ----------
const DescriptionCell = ({ description }) => {
  const [showFull, setShowFull] = useState(false);

  if (!description) return <div className="text-sm text-gray-500">-</div>;

  const words = description.split(' ');
  const wordLimit = 3; // show first 3 words
  const isLong = words.length > wordLimit;
  const shortText = isLong ? words.slice(0, wordLimit).join(' ') : description;

  return (
    <div className="text-sm text-gray-500">
      {showFull || !isLong ? (
        <>
          {description}{' '}
          {isLong && (
            <button
              onClick={() => setShowFull(false)}
              className="text-blue-500 hover:underline"
            >
              (less)
            </button>
          )}
        </>
      ) : (
        <>
          {shortText}...{' '}
          <button
            onClick={() => setShowFull(true)}
            className="text-blue-500 hover:underline"
          >
            more
          </button>
        </>
      )}
    </div>
  );
};

export default function MenuReports() {
  const [filterParams, setFilterParams] = useState({ filter_type: 'all' });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateFilterType, setDateFilterType] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState(null);

  // ---------- Helpers ----------
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const toYMD = (d) => {
    if (!d) return '';
    if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    if (typeof d === 'string') {
      const s = d.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);

      const m1 = s.match(/^(\d{1,2})\s([A-Za-z]{3})\s(\d{4})$/);
      if (m1) {
        const day = parseInt(m1[1], 10);
        const monIdx = MONTHS_SHORT.indexOf(m1[2]);
        const year = parseInt(m1[3], 10);
        if (monIdx >= 0) {
          const dt = new Date(year, monIdx, day);
          if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
        }
      }

      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
    }
    return '';
  };

  const toAPI = (d) => {
    const ymd = toYMD(d);
    return ymd ? formatInputDateForAPI(ymd) : undefined;
  };

  // ---------- Fetch categories ----------
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError(null);
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

  // ---------- Table columns ----------
  const columns = [
    {
      Header: 'Menu Name',
      accessor: 'menu_name',
      minWidth: 200,
      Cell: (row) => <div className="font-medium text-gray-900 whitespace-nowrap">{row.menu_name}</div>
    },
    {
      Header: 'Category',
      accessor: 'category_name',
      minWidth: 150,
      Cell: (row) => <div className="text-sm text-gray-500 whitespace-nowrap">{row.category_name || 'Uncategorized'}</div>
    },
    {
      Header: 'Description',
      accessor: 'description',
      minWidth: 250,
      Cell: ({ value }) => <DescriptionCell description={value} />
    },
    {
      Header: 'Status',
      accessor: 'is_available',
      minWidth: 120,
      Cell: (row) => <div className="text-sm text-gray-500 whitespace-nowrap">{row.is_available ? 'Available' : 'Unavailable'}</div>,
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
        if (!row.portions || row.portions.length === 0) return <div className="text-sm text-gray-500 whitespace-nowrap">No portions</div>;
        return (
          <div className="text-sm text-gray-500 whitespace-nowrap">
            {row.portions.map((portion, index) => (
              <span key={portion.portion_id || index}>
                {portion.portion_name}: ₹{portion.price}{portion.is_available ? ' (Available)' : ' (Unavailable)'}
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

  // ---------- Filters & Handlers ----------
  const handleDateFilterChange = (e) => {
    const { value } = e.target;
    setDateFilterType(value);
    let next = { filter_type: 'all' };
    if (value === 'all') { setStartDate(''); setEndDate(''); }
    else if (value === 'custom') {
      next = { filter_type: 'date_range' };
      if (startDate && endDate) { next.start_date = toAPI(startDate); next.end_date = toAPI(endDate); }
    } else {
      const range = getDateRangeFromType(value) || {};
      const s = toYMD(range.startDate);
      const e2 = toYMD(range.endDate);
      setStartDate(s); setEndDate(e2);
      next = { filter_type: 'date_range', start_date: toAPI(s), end_date: toAPI(e2) };
    }
    if (filterParams.category_id) next.category_id = filterParams.category_id;
    setFilterParams(next);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const normalized = toYMD(value);
    if (name === 'startDate') setStartDate(normalized);
    if (name === 'endDate') setEndDate(normalized);
    if (dateFilterType !== 'custom') return;
    const newStart = name === 'startDate' ? normalized : startDate;
    const newEnd   = name === 'endDate'   ? normalized : endDate;
    const next = { filter_type: 'date_range' };
    if (newStart) next.start_date = toAPI(newStart);
    if (newEnd)   next.end_date   = toAPI(newEnd);
    if (newStart && newEnd && newStart > newEnd) {
      setFilterParams(prev => { const keep = { ...prev }; delete keep.start_date; delete keep.end_date; keep.filter_type = 'date_range'; if (prev.category_id) keep.category_id = prev.category_id; return keep; });
      return;
    }
    if (filterParams.category_id) next.category_id = filterParams.category_id;
    setFilterParams(next);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category_id') {
      const next = { ...filterParams };
      if (value === 'all') delete next.category_id;
      else next.category_id = parseInt(value, 10);
      setFilterParams(next);
    }
  };

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <select value={dateFilterType} onChange={handleDateFilterChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
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
            <input type="date" name="startDate" value={startDate} onChange={handleDateChange} className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="Start Date"/>
            <span className="text-gray-500">to</span>
            <input type="date" name="endDate" value={endDate} min={startDate || undefined} onChange={handleDateChange} className="block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" placeholder="End Date"/>
          </div>
        )}
      </div>
      <div>
        <select name="category_id" value={filterParams.category_id || 'all'} onChange={handleFilterChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" disabled={loadingCategories}>
          <option value="all">All Categories</option>
          {categories.map(category => (<option key={category.category_id} value={category.category_id}>{category.category_name}</option>))}
        </select>
      </div>
    </div>
  );

  const breadcrumbItems = [
    { text: 'Home', url: '/' },
    { text: 'Reports', url: '/reports' },
    { text: 'Menu Reports' }
  ];

  return (
    <div className="py-6">
      <div className="mb-3"><Breadcrumb items={breadcrumbItems} /></div>
      {error && <div className="mb-4 bg-red-50 p-4 rounded-md border border-red-200"><p className="text-red-700">{error}</p></div>}
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
