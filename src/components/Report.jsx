import React, { useState } from 'react';

export default function Report({ title, description, filters, renderContent }) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    setIsLoading(true);
    // In a real app, this would fetch data with the applied filters
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleExport = (format) => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      alert(`Report exported as ${format}`);
    }, 1000);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      window.print();
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range Filter - Always Present */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Dynamic Filters */}
          {filters && filters.map((filter) => (
            <div key={filter.name}>
              <label htmlFor={filter.name} className="block text-sm font-medium text-gray-700 mb-1">{filter.label}</label>
              {filter.type === 'select' ? (
                <select
                  id={filter.name}
                  name={filter.name}
                  value={selectedFilters[filter.name] || ''}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={filter.type || 'text'}
                  id={filter.name}
                  name={filter.name}
                  value={selectedFilters[filter.name] || ''}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={filter.placeholder || ''}
                />
              )}
            </div>
          ))}

          {/* Apply Filters Button */}
          <div className="flex items-end">
            <button 
              onClick={handleApplyFilters}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-3xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Actions */}
      <div className="flex flex-wrap gap-2 justify-end">
        <button 
          onClick={() => handleExport('PDF')}
          disabled={isExporting}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-3xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </button>
        <button 
          onClick={() => handleExport('Excel')}
          disabled={isExporting}
          className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-3xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </button>
        <button 
          onClick={handlePrint}
          disabled={isPrinting}
          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-3xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isPrinting ? 'Printing...' : 'Print'}
        </button>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          renderContent({
            dateRange,
            selectedFilters
          })
        )}
      </div>
    </div>
  );
} 