import React, { useEffect, useState, useRef } from 'react';
import { FaDownload } from 'react-icons/fa';
import { useStatistics } from '../context/StatisticsContext';
import ReactApexChart from 'react-apexcharts';
import { useOutletId, useOutletWarning } from '../hooks/useOutletId';
import { Breadcrumb } from '../components';
import { useNavigate } from 'react-router-dom';

// Food Type Chart Component
const FoodTypeChart = ({ foodTypeData }) => {
  // Early return with empty container if no data
  if (!foodTypeData) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Food Types by Day</h3>
          <p className="text-sm text-gray-500 mb-3">Distribution of food types across days of the week</p>
        </div>
        <div className="p-5 flex items-center justify-center h-[350px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No chart data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract data from the foodTypeData object
  const days = Object.keys(foodTypeData);
  const foodTypes = ['veg', 'nonveg', 'vegan', 'egg'];
  
  // Filter out days that have no data (all zeros)
  const filteredDays = days.filter(day => {
    return foodTypes.some(type => (foodTypeData[day][type] || 0) > 0);
  });
  
  // Check if there's any data - render empty container if no data
  if (filteredDays.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Food Types by Day</h3>
          <p className="text-sm text-gray-500 mb-3">Distribution of food types across days of the week</p>
        </div>
        <div className="p-5 flex items-center justify-center h-[350px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No food type data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Food type badge definitions with colors and labels
  const foodTypeBadges = {
    veg: { color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢', label: 'Vegetarian' },
    nonveg: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴', label: 'Non-Vegetarian' },
    vegan: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🟣', label: 'Vegan' },
    egg: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🟡', label: 'Egg' }
  };

  // Prepare series data - only include food types with non-zero values
  const series = foodTypes
    .map(type => {
    return {
      name: type === 'veg' ? 'Vegetarian' : 
            type === 'nonveg' ? 'Non-Vegetarian' : 
            type === 'vegan' ? 'Vegan' : 'Egg',
        data: filteredDays.map(day => foodTypeData[day][type] || 0)
    };
    })
    .filter(series => series.data.some(value => value > 0)); // Filter out series with all zeros

  const options = {
    chart: {
      type: 'bar',
      stacked: true,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '30%', // Fixed column width regardless of data points
        endingShape: 'rounded',
        distributed: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: filteredDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)),
      labels: {
        style: {
          fontSize: '12px'
      }
      },
      tickPlacement: 'on'
    },
    yaxis: {
      title: {
        text: 'Orders'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " orders";
        }
      }
    },
    colors: ['#10B981', '#EF4444', '#8B5CF6', '#F59E0B'],
    legend: {
      show: false
    },
    grid: {
      padding: {
        left: 20,
        right: 20
      }
    }
  };

  // Get active food types that have data
  const activeFoodTypes = foodTypes.filter(type => 
    filteredDays.some(day => (foodTypeData[day][type] || 0) > 0)
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Food Types by Day</h3>
        <p className="text-sm text-gray-500 mb-3">Distribution of food types across days of the week</p>
        
        {/* Food Type Badges */}
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFoodTypes.map(type => (
            <div key={type} className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${foodTypeBadges[type].color}`}>
              <span className="mr-1">{foodTypeBadges[type].icon}</span>
              {foodTypeBadges[type].label}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="bar" 
          height={350} 
        />
      </div>
    </div>
  );
};

// Revenue Trend Chart Component
const RevenueTrendChart = ({ revenueData }) => {
  // Early return with empty container if no data
  if (!revenueData || Object.keys(revenueData).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Revenue Trend</h3>
          <p className="text-sm text-gray-500">Daily revenue over time</p>
        </div>
        <div className="p-5 flex items-center justify-center h-[350px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No revenue data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract dates and revenue values
  const dates = Object.keys(revenueData).sort();
  const revenues = dates.map(date => revenueData[date] || 0);
  
  // Check if there's any non-zero data
  if (!revenues.some(value => value > 0)) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Revenue Trend</h3>
          <p className="text-sm text-gray-500">Daily revenue over time</p>
        </div>
        <div className="p-5 flex items-center justify-center h-[350px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No revenue data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Format dates for display
  const formattedDates = dates.map(date => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}`;
  });
  
  const options = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    xaxis: {
      categories: formattedDates,
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: {
          fontSize: '12px'
        }
      },
      tickAmount: Math.min(dates.length, 10)
    },
    yaxis: {
      title: {
        text: 'Revenue (₹)'
      },
      labels: {
        formatter: function(val) {
          return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val;
        }
      }
    },
    colors: ['#3B82F6'],
    tooltip: {
      y: {
        formatter: function(val) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
          }).format(val);
        }
      }
    },
    markers: {
      size: 4,
      colors: ['#3B82F6'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6
      }
    }
  };

  const series = [{
    name: 'Revenue',
    data: revenues
  }];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Revenue Trend</h3>
        <p className="text-sm text-gray-500">Daily revenue over time</p>
      </div>
      <div className="p-5">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="area" 
          height={350} 
        />
      </div>
    </div>
  );
};

// Order Trend Chart Component
const OrderTrendChart = ({ orderData }) => {
  // Early return with empty container if no data
  if (!orderData || Object.keys(orderData).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Order Trend</h3>
          <p className="text-sm text-gray-500">Daily order count over time</p>
        </div>
        <div className="p-5 flex items-center justify-center h-[350px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No order data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract dates and order counts
  const dates = Object.keys(orderData).sort();
  const orders = dates.map(date => orderData[date] || 0);
  
  // Check if there's any non-zero data
  if (!orders.some(value => value > 0)) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Order Trend</h3>
          <p className="text-sm text-gray-500">Daily order count over time</p>
        </div>
        <div className="p-5 flex items-center justify-center h-[350px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No order data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Format dates for display
  const formattedDates = dates.map(date => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}`;
  });
  
  const options = {
    chart: {
      type: 'line',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight',
      width: 3
    },
    xaxis: {
      categories: formattedDates,
      labels: {
        rotate: -45,
        rotateAlways: false,
        style: {
          fontSize: '12px'
        }
      },
      tickAmount: Math.min(dates.length, 10)
    },
    yaxis: {
      title: {
        text: 'Number of Orders'
      },
      labels: {
        formatter: function(val) {
          return Math.round(val);
        }
      }
    },
    colors: ['#10B981'],
    tooltip: {
      y: {
        formatter: function(val) {
          return Math.round(val) + ' orders';
        }
      }
    },
    markers: {
      size: 4,
      colors: ['#10B981'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6
      }
    },
    grid: {
      borderColor: '#e0e0e0',
      row: {
        colors: ['#f8f9fa', 'transparent'],
        opacity: 0.5
      }
    }
  };

  const series = [{
    name: 'Orders',
    data: orders
  }];

    return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Order Trend</h3>
        <p className="text-sm text-gray-500">Daily order count over time</p>
        </div>
      <div className="p-5">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="line" 
          height={350} 
        />
      </div>
    </div>
  );
};

// Top Items Chart Component
const TopItemsChart = ({ topItems }) => {
  if (!topItems || !Array.isArray(topItems) || topItems.length === 0) return null;
  
  // Sort items by quantity in descending order and take top 10
  const sortedItems = [...topItems]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
  
  // Extract names and quantities
  const names = sortedItems.map(item => item.name);
  const quantities = sortedItems.map(item => item.quantity);
  const revenues = sortedItems.map(item => item.revenue);
  
  const options = {
    chart: {
      type: 'bar',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: false,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: ['#3B82F6'],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      offsetX: 20,
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: names,
      labels: {
        formatter: function (val) {
          return Math.round(val);
        }
      }
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return val.length > 15 ? val.substring(0, 15) + '...' : val;
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val, { seriesIndex, dataPointIndex, w }) {
          return `${val} orders - ₹${revenues[dataPointIndex]}`;
        }
      }
    },
    title: {
      text: 'Top Selling Items',
      floating: false,
      offsetY: 0,
      align: 'center',
      style: {
        color: '#444'
      }
    }
  };

  const series = [{
    name: 'Quantity Sold',
    data: quantities
  }];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Top Selling Items</h3>
        <p className="text-sm text-gray-500">Items with highest sales volume</p>
          </div>
      <div className="p-5">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="bar" 
          height={350} 
        />
        </div>
    </div>
  );
};

// Payment Method Chart Component
const PaymentMethodChart = ({ paymentData }) => {
  if (!paymentData) return null;
  
  // Extract payment methods and their counts
  const methods = Object.keys(paymentData).filter(key => key !== 'total');
  const counts = methods.map(method => paymentData[method] || 0);
  
  // Filter out zero values
  const filteredMethods = [];
  const filteredCounts = [];
  methods.forEach((method, index) => {
    if (counts[index] > 0) {
      filteredMethods.push(method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, ' '));
      filteredCounts.push(counts[index]);
    }
  });
  
  // If no data, return null
  if (filteredCounts.length === 0) return null;

  const options = {
    chart: {
      type: 'pie',
      fontFamily: 'Inter, sans-serif',
    },
    labels: filteredMethods,
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 12
      },
    },
    plotOptions: {
      pie: {
        dataLabels: {
          offset: -10
        }
      }
    },
    dataLabels: {
      formatter: function (val, { seriesIndex, dataPointIndex, w }) {
        return w.config.series[seriesIndex] + ' (' + val.toFixed(1) + '%)';
      },
      style: {
        fontSize: '12px',
        colors: ['#fff'],
        textShadow: 'none'
      },
      background: {
        enabled: false
      },
      dropShadow: {
        enabled: false
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Payment Methods</h3>
        <p className="text-sm text-gray-500">Distribution of payment methods used</p>
      </div>
      <div className="p-5">
        <ReactApexChart 
          options={options} 
          series={filteredCounts} 
          type="pie" 
          height={350} 
          />
        </div>
    </div>
  );
};

// Collection Sources Card Component
const CollectionSourcesCard = ({ collectionData }) => {
  // Early return with empty container if no data
  if (!collectionData) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Total Collections Sources</h3>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">Total: ₹0</span>
            </p>
          </div>  
        </div>
        <div className="p-5 flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No collection data available</p>
          </div>
        </div>
      </div>
    );
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate total collection
  const totalAmount = 
    (collectionData.upi_amount || 0) +
    (collectionData.cash_amount || 0) +
    (collectionData.card_amount || 0) +
    (collectionData.complementary_amount || 0) +
    (collectionData.udhari_amount || 0) +
    (collectionData.advance_payment_amount || 0);

  // If total amount is 0, show empty container
  if (totalAmount === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Total Collections Sources</h3>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-900">Total: ₹0</span>
            </p>
          </div>  
        </div>
        <div className="p-5 flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No collection data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for progress bars
  const paymentMethods = [
    {
      name: 'UPI',
      amount: collectionData.upi_amount || 0,
      orders: collectionData.upi_orders || 0,
      color: 'bg-indigo-500'
    },
    {
      name: 'Cash',
      amount: collectionData.cash_amount || 0,
      orders: collectionData.cash_orders || 0,
      color: 'bg-purple-500'
    },
    {
      name: 'Card',
      amount: collectionData.card_amount || 0,
      orders: collectionData.card_orders || 0,
      color: 'bg-blue-500'
    },
    {
      name: 'Complementary',
      amount: collectionData.complementary_amount || 0,
      orders: collectionData.complementary_orders || 0,
      color: 'bg-pink-500'
    },
    {
      name: 'Udhari',
      amount: collectionData.udhari_amount || 0,
      orders: collectionData.udhari_orders || 0,
      color: 'bg-yellow-500'
    },
    {
      name: 'Advance Payment',
      amount: collectionData.advance_payment_amount || 0,
      orders: collectionData.advance_payment_orders || 0,
      color: 'bg-green-500'
    }
  ].filter(method => method.amount > 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-800">Total Collections Sources</h3>
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">Total: {formatCurrency(totalAmount)}</span>
          </p>
        </div>  
      </div>
      <div className="p-5 space-y-4">
        {paymentMethods.map((method, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{method.name}</span>
              <span className="text-sm">
                <span className="font-medium text-gray-900">{formatCurrency(method.amount)}</span> <span className="text-gray-500">({method.orders} orders)</span>
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`${method.color} h-2.5 rounded-full`} 
                style={{ width: `${(method.amount / totalAmount) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Order Statistics Card Component
const OrderStatisticsCard = ({ orderStats }) => {
  // Early return with empty container if no data
  if (!orderStats) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Order Statistics</h3>
        </div>
        <div className="p-5 flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No order statistics available</p>
          </div>
        </div>
      </div>
    );
  }

  const orderTypes = [
    {
      name: 'Success Order',
      count: orderStats.success_orders || 0,
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="h-5 w-5 text-green-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      name: 'Cancelled Order',
      count: orderStats.cancelled_orders || 0,
      color: 'bg-red-100 text-red-800',
      icon: (
        <svg className="h-5 w-5 text-red-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    },
    {
      name: 'Complementary Order',
      count: orderStats.complementary_orders || 0,
      color: 'bg-purple-100 text-purple-800',
      icon: (
        <svg className="h-5 w-5 text-purple-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    {
      name: 'Kitchen Order',
      count: orderStats.KOT_orders || 0,
      color: 'bg-yellow-100 text-yellow-800',
      icon: (
        <svg className="h-5 w-5 text-yellow-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      name: 'Udhari Order',
      count: orderStats.udhari_orders || 0,
      color: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="h-5 w-5 text-blue-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ].filter(type => type.count > 0);

  // If no order types have non-zero counts, show empty container
  if (orderTypes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Order Statistics</h3>
        </div>
        <div className="p-5 flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No order statistics available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Order Statistics</h3>
            </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {orderTypes.map((type, index) => (
          <div 
            key={index} 
            className={`${type.color} rounded-lg p-4 flex items-center`}
          >
            <div className="flex-shrink-0 mr-3 flex items-center self-center">
              {type.icon}
              </div>
            <div>
              <span className="text-2xl font-bold block">{type.count}</span>
              <span className="text-sm">{type.name}</span>
            </div>
          </div>
        ))}
        </div>
    </div>
  );
};

// Order Type Stats Card Component
const OrderTypeStatsCard = ({ orderTypeData }) => {
  if (!orderTypeData) return null;

  const orderTypes = [
    {
      name: 'Dine In',
      count: orderTypeData['dine-in'] || 0,
      color: 'bg-purple-100 text-purple-800',
      icon: (
        <svg className="h-5 w-5 text-purple-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Parcel',
      count: orderTypeData['parcel'] || 0,
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="h-5 w-5 text-green-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      )
    },
    {
      name: 'Delivery',
      count: orderTypeData['delivery'] || 0,
      color: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="h-5 w-5 text-blue-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      name: 'Counter',
      count: orderTypeData['counter'] || 0,
      color: 'bg-red-100 text-red-800',
      icon: (
        <svg className="h-5 w-5 text-red-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
        </svg>
      )
    },
    {
      name: 'Drive Through',
      count: orderTypeData['drive-through'] || 0,
      color: 'bg-yellow-100 text-yellow-800',
      icon: (
        <svg className="h-5 w-5 text-yellow-500 mt-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    }
  ].filter(type => type.count > 0);

  return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Order Type Statistics</h3>
            </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {orderTypes.map((type, index) => (
          <div 
            key={index} 
            className={`${type.color} rounded-lg p-4 flex items-center`}
          >
            <div className="flex-shrink-0 mr-3 flex items-center self-center">
              {type.icon}
                  </div>
            <div>
              <span className="text-2xl font-bold block">{type.count}</span>
            <span className="text-sm">{type.name}</span>
            </div>
                </div>
              ))}
            </div>
          </div>
  );
};

// Weekly Order Stats Chart Component
const WeeklyOrderStatsChart = ({ weeklyData }) => {
  if (!weeklyData || !weeklyData.data) return null;

  // Filter out days with zero orders
  const filteredData = weeklyData.data.filter(day => parseInt(day[1]) > 0);
  
  // Extract days and counts from filtered data
  const days = filteredData.map(day => day[0]);
  const counts = filteredData.map(day => parseInt(day[1]));
  
  // Check if we have any non-zero data
  if (filteredData.length === 0) return null;
  
  const options = {
    chart: {
      type: 'bar',
      height: 350,
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '30%', // Fixed column width for consistency
        endingShape: 'rounded',
        distributed: true
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: days,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
      }
      },
      tickPlacement: 'on'
    },
    yaxis: {
      title: {
        text: 'Orders'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " orders";
        }
      }
    },
    colors: ['#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6', '#8B5CF6'],
    legend: {
      show: false
    },
    annotations: {
      points: []
    },
    grid: {
      padding: {
        left: 20,
        right: 20
      }
    }
  };

  // Add peak day annotation if it's a valid day (not "None")
  if (weeklyData.peak_day && weeklyData.peak_day[0] && weeklyData.peak_day[0] !== "None" && days.includes(weeklyData.peak_day[0])) {
    options.annotations.points.push({
      x: weeklyData.peak_day[0],
      y: parseInt(weeklyData.peak_day[1]),
      marker: {
        size: 6,
        fillColor: '#FF4560',
        strokeColor: '#fff',
        strokeWidth: 2,
        radius: 2
      },
      label: {
        borderColor: '#FF4560',
        offsetY: 0,
        style: {
          color: '#fff',
          background: '#FF4560',
          fontSize: '10px',
          fontWeight: 'bold'
        },
        text: 'Peak Day'
      }
    });
  }

  const series = [{
    name: 'Orders',
    data: counts
  }];

  // Find the peak day and low day
  const peakDay = weeklyData.peak_day || ["None", "0"];
  const lowDay = weeklyData.low_day || ["None", "0"];

  return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Weekly Order Statistics</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          {peakDay[0] !== "None" && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Peak: {peakDay[0]} - {peakDay[1]} orders
            </div>
          )}
          {lowDay[0] !== "None" && (
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Low: {lowDay[0]} - {lowDay[1]} orders
              </div>
          )}
            </div>
          </div>
      <div className="p-5">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="bar" 
          height={350} 
        />
        </div>
    </div>
  );
};

// Products Analysis Card Component
const ProductsAnalysisCard = ({ categoryData }) => {
  if (!categoryData || !Array.isArray(categoryData) || categoryData.length === 0) return null;

  const [activeTab, setActiveTab] = useState('top');

  // Get top selling items across all categories
  const topSellingItems = categoryData.flatMap(category => 
    category.top_menus.map(menu => ({
      ...menu,
      category_name: category.category_name
    }))
  ).sort((a, b) => b.sales_count - a.sales_count).slice(0, 5);

  // Get low selling items (reverse of top selling)
  const lowSellingItems = [...topSellingItems].sort((a, b) => a.sales_count - b.sales_count).slice(0, 5);

  // If no items to display, don't render the card
  if (topSellingItems.length === 0) return null;

  return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Products Analysis</h3>
        <div className="mt-4 flex justify-center">
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <button 
            onClick={() => setActiveTab('top')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'top' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Top Selling
          </button>
          <button 
            onClick={() => setActiveTab('low')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'low' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Low Selling
          </button>
          </div>
        </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menu Name
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sales Count
              </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
            {(activeTab === 'top' ? topSellingItems : lowSellingItems).map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.menu_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {item.sales_count}
                </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  );
};

// App Usage Stats Card Component
const AppUsageStatsChart = ({ appUsageData }) => {
  if (!appUsageData) return null;

  // Create data array with app usage values
  const data = [
    { name: 'Owner App', value: Math.max(0, appUsageData.owner_app || 0) },
    { name: 'POS App', value: Math.max(0, appUsageData.pos_app || 0) },
    { name: 'Waiter App', value: Math.max(0, appUsageData.waiter_app || 0) },
    { name: 'Captain App', value: Math.max(0, appUsageData.captain_app || 0) },
    { name: 'Customer App', value: Math.max(0, appUsageData.user_app || 0) },
    { name: 'KDS App', value: Math.max(0, appUsageData.kds_app || 0) },
    { name: 'CDS App', value: Math.max(0, appUsageData.cds_app || 0) }
  ];

  // Filter out apps with zero usage
  const filteredData = data.filter(item => item.value > 0);
  
  // If no data with non-zero values, don't render the card
  if (filteredData.length === 0) return null;

  // Sort data by usage count (descending)
  filteredData.sort((a, b) => b.value - a.value);

  const options = {
    chart: {
      type: 'bar',
      height: Math.max(250, filteredData.length * 50), // Dynamic height based on number of items
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        dataLabels: {
          position: 'front'
        },
        borderRadius: 2
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      textAnchor: 'start',
      offsetX: 5,
      style: {
        fontSize: '12px',
        colors: ['#fff'],
        fontWeight: 500
      },
      background: {
        enabled: false
      }
    },
    colors: ['#8B5CF6', '#7C3AED', '#9333EA', '#A855F7', '#C084FC', '#D8B4FE', '#E9D5FF'],
    xaxis: {
      categories: filteredData.map(d => d.name),
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      }
    },
    yaxis: {
      labels: {
        show: true
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " usages";
        }
      }
    },
    legend: {
      show: false
    }
  };

  const series = [{
    name: 'Usage',
    data: filteredData.map(d => d.value)
  }];

  return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">App Usage Statistics</h3>
      </div>
      <div className="p-5">
        <ReactApexChart 
          options={options} 
          series={series} 
          type="bar" 
          height={options.chart.height} 
        />
      </div>
    </div>
  );
};

// Category Performance Card Component
const CategoryPerformanceCard = ({ categoryData }) => {
  if (!categoryData || !Array.isArray(categoryData) || categoryData.length === 0) return null;

  // Check if there are any categories with orders
  const hasOrders = categoryData.some(category => category.total_orders > 0);
  if (!hasOrders) return null;

  // Sort categories by total orders
  const sortedCategories = [...categoryData].sort((a, b) => b.total_orders - a.total_orders);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Category Performance</h3>
        <p className="text-sm text-gray-500">
          {sortedCategories.length} categories
        </p>
      </div>
      <div className="p-5">
        {sortedCategories.map((category, index) => (
          <div key={index} className="mb-6 last:mb-0">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">{category.category_name}</h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {category.top_menus.slice(0, 3).map((menu, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                      {menu.menu_name} ({menu.sales_count})
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-sm font-semibold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded">
                {category.total_orders} orders
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${(category.total_orders / sortedCategories[0].total_orders) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Combo Orders Card Component
const TopComboOrdersCard = ({ comboData }) => {
  if (!comboData || !Array.isArray(comboData) || comboData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Top Combo Orders</h3>
          <p className="text-sm text-gray-500">
            Most frequently ordered combinations
          </p>
        </div>
        <div className="p-5 flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No combo order data available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Top Combo Orders</h3>
        <p className="text-sm text-gray-500">
          Most frequently ordered combinations
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Combo Items
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comboData.map((combo, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {combo.items.map((item, idx) => (
                    <span key={idx}>
                      {item.name}
                      {idx < combo.items.length - 1 ? ' + ' : ''}
                    </span>
                  ))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {combo.order_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Advanced Payment Stats Card Component
const AdvancedPaymentStatsCard = ({ udhariData, advancePaymentData }) => {
  if (!udhariData && !advancePaymentData) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Advanced Payment Statistics</h3>
        </div>
        <div className="p-5 flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No payment data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if there's any non-zero data
  const hasUdhariData = udhariData && 
    (udhariData.udhari_pending.amount > 0 || 
     udhariData.udhari_pending.count > 0 || 
     udhariData.udhari_paid.amount > 0 || 
     udhariData.udhari_paid.count > 0);
     
  const hasAdvancePaymentData = advancePaymentData && 
    (advancePaymentData.partial_payment.amount > 0 || 
     advancePaymentData.partial_payment.count > 0 || 
     advancePaymentData.settled_payment.amount > 0 || 
     advancePaymentData.settled_payment.count > 0);

  if (!hasUdhariData && !hasAdvancePaymentData) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Advanced Payment Statistics</h3>
        </div>
        <div className="p-5 flex items-center justify-center h-[200px]">
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No payment data available</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-800">Advanced Payment Statistics</h3>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {hasUdhariData && (
          <div className="p-5">
            <h4 className="font-medium text-gray-700 mb-4">Udhari Payment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-sm text-amber-700 mb-1">Pending</p>
                <p className="text-xl font-semibold text-amber-900">
                  {formatCurrency(udhariData.udhari_pending.amount)}
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {udhariData.udhari_pending.count} transactions
                </p>
      </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700 mb-1">Paid</p>
                <p className="text-xl font-semibold text-green-900">
                  {formatCurrency(udhariData.udhari_paid.amount)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {udhariData.udhari_paid.count} transactions
                </p>
              </div>
            </div>
          </div>
        )}
        
        {hasAdvancePaymentData && (
          <div className="p-5">
            <h4 className="font-medium text-gray-700 mb-4">Settled Payment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">Partial Payment</p>
                <p className="text-xl font-semibold text-blue-900">
                  {formatCurrency(advancePaymentData.partial_payment.amount)}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {advancePaymentData.partial_payment.count} transactions
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-700 mb-1">Settled Payment</p>
                <p className="text-xl font-semibold text-purple-900">
                  {formatCurrency(advancePaymentData.settled_payment.amount)}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  {advancePaymentData.settled_payment.count} transactions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Statistics() {
  const { statistics, fetchStatistics, error, updateDateRange } = useStatistics();
  const outletId = useOutletId();
  const { warningElement } = useOutletWarning();
  const fetchedForOutletRef = useRef(null);
  const navigate = useNavigate();
  const [currentDateRange, setCurrentDateRange] = useState({ type: 'all' });

  // Add debugging logs for component lifecycle and render
  useEffect(() => {
    console.log('[Statistics] Component mounted');
    
    return () => {
      console.log('[Statistics] Component unmounted');
    };
  }, []);

  // Debug current data state
  useEffect(() => {
    console.log('[Statistics] Data state update:', {
      hasData: !!statistics,
      outletId: statistics?.outlet_id,
      currentContextOutletId: outletId,
      fetchedForOutlet: fetchedForOutletRef.current
    });
  }, [statistics, outletId]);

  // Breadcrumb items
  const breadcrumbItems = [
    { text: 'Dashboard', url: '/' },
    { text: 'Statistics' }
  ];

  // Listen for date range changes from the header component
  useEffect(() => {
    const handleDateRangeChange = (event) => {
      const range = event.detail;
      setCurrentDateRange(range);
      
      // Prepare the API parameters based on the range type
      const params = { outlet_id: outletId };
      
      if (range.type === 'custom' && range.startDate && range.endDate) {
        // For custom range, convert from YYYY-MM-DD to DD MMM YYYY format
        params.start_date = formatDateForApi(new Date(range.startDate));
        params.end_date = formatDateForApi(new Date(range.endDate));
      } else if (range.type !== 'all') {
        // For predefined ranges, calculate the dates
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();
        
        switch (range.type) {
          case 'today':
            // Just use today for both
            break;
          case 'yesterday':
            startDate.setDate(today.getDate() - 1);
            endDate.setDate(today.getDate() - 1);
            break;
          case 'last7days':
            startDate.setDate(today.getDate() - 6);
            break;
          case 'last30days':
            startDate.setDate(today.getDate() - 29);
            break;
          case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
          case 'lastMonth':
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
          default:
            // Default case, don't set date parameters
            break;
        }
        
        if (range.type !== 'all') {
          params.start_date = formatDateForApi(startDate);
          params.end_date = formatDateForApi(endDate);
        }
      }
      
      console.log('Fetching statistics with params:', params);
      
      // Fetch statistics with the date range
      fetchStatistics(params, true);
    };

    // Format date as "DD MMM YYYY" (e.g. "17 Jun 2025")
    const formatDateForApi = (date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    // Listen for date range change events
    window.addEventListener('daterange:changed', handleDateRangeChange);
    
    return () => {
      window.removeEventListener('daterange:changed', handleDateRangeChange);
    };
  }, [outletId, fetchStatistics]);

  // Fetch statistics data only when component mounts or outlet changes
  useEffect(() => {
    // Only fetch if outlet ID exists and is different from the last one we fetched for
    if (outletId && fetchedForOutletRef.current !== outletId) {
      console.log('Fetching statistics for outlet:', outletId);
      
      // Check if we already have statistics data for this outlet in context
      if (!statistics || statistics.outlet_id !== parseInt(outletId, 10)) {
        // Only force refresh when the outlet has changed or data doesn't exist
        fetchStatistics({ outlet_id: outletId }, false); // Use context caching - don't force refresh
      }
      
      fetchedForOutletRef.current = outletId; // Remember which outlet we fetched for
    }
  }, [outletId, fetchStatistics, statistics]);

  // Format currency in Indian format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format turnover time
  const formatTurnoverTime = (timeStr) => {
    if (!timeStr) return '0 min';
    
    // Extract minutes and seconds if in format "X min Y sec"
    const minutesSecondsMatch = timeStr.match(/(\d+)\s*hr(?:\s*(\d+)\s*min)?(?:\s*(\d+)\s*sec)?/);
    if (minutesSecondsMatch) {
      const hours = parseInt(minutesSecondsMatch[1], 10) || 0;
      const minutes = parseInt(minutesSecondsMatch[2], 10) || 0;
      
      if (hours > 0) {
        return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
      }
      return `${minutes}m`;
    }
    
    return timeStr;
  };

  // Check if we have analytics data
  const hasAnalytics = statistics && statistics.analytic_reports && 
    (statistics.analytic_reports.total_orders > 0 || statistics.analytic_reports.total_revenue > 0);
  const hasOrderTypeData = statistics && statistics.order_type_statistics && 
    Object.values(statistics.order_type_statistics).some(val => val > 0);
  const hasFoodTypeData = statistics && statistics.food_type_statistics && 
    Object.keys(statistics.food_type_statistics).some(day => 
      Object.values(statistics.food_type_statistics[day]).some(val => val > 0)
    );
  const hasOrderStatistics = statistics && statistics.order_statistics && 
    Object.values(statistics.order_statistics).some(val => val > 0);
  const hasWeeklyOrderStats = statistics && statistics.weekly_order_stats && 
    statistics.weekly_order_stats.data && 
    statistics.weekly_order_stats.data.some(day => parseInt(day[1]) > 0);
  const hasCollectionSource = statistics && statistics.total_collection_source && 
    (statistics.total_collection_source.upi_amount > 0 || 
     statistics.total_collection_source.cash_amount > 0 ||
     statistics.total_collection_source.card_amount > 0 ||
     statistics.total_collection_source.complementary_amount > 0 ||
     statistics.total_collection_source.udhari_amount > 0 ||
     statistics.total_collection_source.advance_payment_amount > 0);
  const hasAppUsage = statistics && statistics.app_usage_statistics && 
    Object.values(statistics.app_usage_statistics).some(val => val > 0);
  const hasCategoryPerformance = statistics && statistics.category_wise_performance && 
    Array.isArray(statistics.category_wise_performance) && 
    statistics.category_wise_performance.length > 0;
  const hasMenuCombos = statistics && statistics.menu_combos && 
    Array.isArray(statistics.menu_combos) && 
    statistics.menu_combos.length > 0;
  const hasCouponStats = statistics && statistics.coupon_statistics && 
    Array.isArray(statistics.coupon_statistics) && 
    statistics.coupon_statistics.length > 0;
  const hasUdhariCard = statistics && statistics.udhari_card && 
    (statistics.udhari_card.udhari_pending.count > 0 || 
     statistics.udhari_card.udhari_paid.count > 0);
  const hasAdvancePayment = statistics && statistics.advance_payment_card && 
    (statistics.advance_payment_card.partial_payment.count > 0 || 
     statistics.advance_payment_card.settled_payment.count > 0);

  // Handle case where no data is available yet
  const hasAnyData = statistics && Object.keys(statistics).length > 0 && 
    (hasAnalytics || hasOrderTypeData || hasFoodTypeData || hasOrderStatistics || 
     hasWeeklyOrderStats || hasCollectionSource || hasAppUsage || hasCategoryPerformance || 
     hasMenuCombos || hasUdhariCard || hasAdvancePayment);

  // If no outlet is selected, show warning
  if (!outletId) {
    return (
      <div className="space-y-4 p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Statistics Dashboard</h1>
        </div>
        {warningElement}
      </div>
    );
  }

  // Get formatted date range for display
  const getActiveDateRangeText = () => {
    if (!currentDateRange || currentDateRange.type === 'all') return null;
    
    switch (currentDateRange.type) {
      case 'custom':
        if (currentDateRange.startDate && currentDateRange.endDate) {
          const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
          };
          return `${formatDate(currentDateRange.startDate)} to ${formatDate(currentDateRange.endDate)}`;
        }
        return null;
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last7days':
        return 'Last 7 Days';
      case 'last30days':
        return 'Last 30 Days';
      case 'thisMonth':
        return 'This Month';
      case 'lastMonth':
        return 'Last Month';
      default:
        return null;
    }
  };

  const activeDateRangeText = getActiveDateRangeText();

  return (
    <div className="space-y-4 p-2 sm:p-3">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-3 p-1 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Statistics Dashboard</h1>
        </div>
        
        {activeDateRangeText && (
          <div className="mt-2 sm:mt-0 flex items-center">
            <span className="inline-flex items-center px-4 py-2 rounded-md bg-primary-50 text-primary-800 border border-primary-200 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Filtered by: {activeDateRangeText}</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Show error message if there was an error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}. 
                <button 
                  className="ml-2 font-medium underline" 
                  onClick={() => fetchStatistics({ outlet_id: outletId }, true)}
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Always render all components, they will handle empty states internally */}
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            value={statistics?.analytic_reports?.total_orders || 0}
            title="Total Orders"
            icon="orders"
          />
          <SummaryCard
            value={formatCurrency(statistics?.analytic_reports?.total_revenue || 0)}
            title="Total Revenue"
            icon="revenue"
          />
          <SummaryCard
            value={formatCurrency(statistics?.analytic_reports?.avg_order_value || 0)}
            title="Avg. Order Value"
            icon="average"
          />
          <SummaryCard
            value={formatTurnoverTime(statistics?.analytic_reports?.average_turnover_time || '0 min')}
            title="Avg. Turnover Time"
            icon="time"
          />
        </div>
        
        {/* Collection Sources and Order Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollectionSourcesCard collectionData={statistics?.total_collection_source} />
          <OrderStatisticsCard orderStats={statistics?.order_statistics} />
        </div>
        
        {/* Order Type and Food Type Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderTypeStatsCard orderTypeData={statistics?.order_type_statistics} />
          <FoodTypeChart foodTypeData={statistics?.food_type_statistics} />
        </div>
        
        {/* Products Analysis and Weekly Order Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductsAnalysisCard categoryData={statistics?.category_wise_performance} />
          <WeeklyOrderStatsChart weeklyData={statistics?.weekly_order_stats} />
        </div>
        
        {/* App Usage Chart */}
        <div className="grid grid-cols-1 gap-6">
          <AppUsageStatsChart appUsageData={statistics?.app_usage_statistics} />
        </div>
        
        {/* Category Performance and Top Combo Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryPerformanceCard categoryData={statistics?.category_wise_performance} />
          <TopComboOrdersCard comboData={statistics?.menu_combos} />
        </div>
        
        {/* Payment Statistics */}
        <div className="grid grid-cols-1 gap-6">
          <AdvancedPaymentStatsCard 
            udhariData={statistics?.udhari_card} 
            advancePaymentData={statistics?.advance_payment_card} 
          />
        </div>
      </>
    </div>
  );
}

const SummaryCard = ({ title, value, icon }) => {
  const getIconComponent = () => {
    switch (icon) {
      case 'orders':
        return (
          <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'revenue':
        return (
          <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'average':
        return (
          <svg className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'time':
        return (
          <svg className="h-8 w-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {getIconComponent()}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
              <dt className="text-sm font-medium text-gray-500 truncate mt-1">{title}</dt>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}; 