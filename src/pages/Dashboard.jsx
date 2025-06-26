import React, { useState, useEffect } from 'react';
import { FaChartPie, FaToggleOn, FaToggleOff, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useOutlet } from '../context/OutletContext';
import { useOutletWarning } from '../hooks/useOutletId.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentOutlet, updateCurrentOutlet } = useOutlet();
  const { hasOutlet, warningElement } = useOutletWarning();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!hasOutlet) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // In a real application, you would pass the outlet_id to the API
        // const outletId = currentOutlet.outlet_id;
        
        // Simulate API call with mock data
        setTimeout(() => {
          const mockData = {
            today_statistics: {
              total_orders: 35,
              total_sales: 12478.50,
              avg_order_value: 356.53,
              online_orders: 28,
              cash_orders: 7,
              cancelled_orders: 2
            },
            weekly_statistics: {
              total_orders: 245,
              total_sales: 87235.75,
              avg_order_value: 355.65
            },
            monthly_statistics: {
              total_orders: 1023,
              total_sales: 364782.30,
              avg_order_value: 356.58
            },
            top_selling_items: [
              { name: "Butter Chicken", quantity: 48, revenue: 8640 },
              { name: "Paneer Tikka", quantity: 42, revenue: 7140 },
              { name: "Veg Biryani", quantity: 36, revenue: 5400 },
              { name: "Chicken Biryani", quantity: 34, revenue: 5780 },
              { name: "Masala Dosa", quantity: 30, revenue: 3600 }
            ]
          };

          setStats(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasOutlet, currentOutlet]);

  const toggleOutletStatus = () => {
    if (!currentOutlet) return;
    
    // Update the outlet in context
    const updatedOutlet = {
      ...currentOutlet,
      is_open: !currentOutlet.is_open
    };
    updateCurrentOutlet(updatedOutlet);

    // Simulate API call
    console.log("Toggling outlet status to:", !currentOutlet.is_open);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate percentage change (mock data for now)
  const getPercentChange = (value, type) => {
    const changes = {
      total_orders: 12.5,
      total_sales: 8.3,
      avg_order_value: -2.1
    };
    return changes[type] || 0;
  };

  if (!hasOutlet) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
        {warningElement}
        <p className="text-gray-600 mt-4">Please select an outlet to view dashboard data.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header section with outlet status toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {currentOutlet.name} - Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back to your outlet dashboard.
            {currentOutlet.outlet_code && <span className="ml-2 text-xs font-medium text-primary-600">#{currentOutlet.outlet_code}</span>}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center">
          <span className="text-sm font-medium mr-3">Outlet Status:</span>
          <button
            onClick={toggleOutletStatus}
            className={`flex items-center px-4 py-2 rounded-full text-white transition-all ${
              currentOutlet.is_open ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {currentOutlet.is_open ? (
              <>
                <FaToggleOn className="mr-2" />
                <span>OPEN</span>
              </>
            ) : (
              <>
                <FaToggleOff className="mr-2" />
                <span>CLOSED</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Statistics Section */}
      <div className="space-y-6">
        {/* Today's Overview */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard 
              title="Total Orders" 
              value={stats.today_statistics.total_orders} 
              type="number"
              percentChange={getPercentChange('total_orders')}
              icon={<FaChartPie className="text-primary-500" />}
            />
            <StatCard 
              title="Total Sales" 
              value={stats.today_statistics.total_sales} 
              type="currency"
              percentChange={getPercentChange('total_sales')}
            />
            <StatCard 
              title="Average Order Value" 
              value={stats.today_statistics.avg_order_value} 
              type="currency"
              percentChange={getPercentChange('avg_order_value')}
            />
          </div>
        </div>
        
        {/* More Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Overview */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Weekly Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-xl font-bold">{stats.weekly_statistics.total_orders}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">Sales</p>
                <p className="text-xl font-bold">{formatCurrency(stats.weekly_statistics.total_sales)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">Avg. Order</p>
                <p className="text-xl font-bold">{formatCurrency(stats.weekly_statistics.avg_order_value)}</p>
              </div>
            </div>
          </div>

          {/* Monthly Overview */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Performance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">Orders</p>
                <p className="text-xl font-bold">{stats.monthly_statistics.total_orders}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">Sales</p>
                <p className="text-xl font-bold">{formatCurrency(stats.monthly_statistics.total_sales)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-500">Avg. Order</p>
                <p className="text-xl font-bold">{formatCurrency(stats.monthly_statistics.avg_order_value)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Selling Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5">
            <h3 className="text-lg font-medium text-gray-800">Top Selling Items</h3>
            <p className="text-sm text-gray-500">Your top 5 most popular items this month</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.top_selling_items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, type, percentChange, icon }) => {
  const formattedValue = type === 'currency' 
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value)
    : value;

  const isPositiveChange = percentChange >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{formattedValue}</p>
        </div>
        <div className="self-start">
          {icon || (
            type === 'currency' ? <FaChartPie className="text-primary-500" /> : null
          )}
        </div>
      </div>
      {percentChange !== undefined && (
        <div className="mt-2">
          <span className={`inline-flex items-center text-sm ${
            isPositiveChange ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositiveChange ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {Math.abs(percentChange)}% from yesterday
          </span>
        </div>
      )}
    </div>
  );
}; 