import React from 'react';
import { FaStore, FaChartBar, FaExchangeAlt } from 'react-icons/fa';
import { useOutlet } from '../context/OutletContext';
import { useOutletWarning } from '../hooks/useOutletId.jsx';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentOutlet } = useOutlet();
  const { hasOutlet, warningElement } = useOutletWarning();

  if (!hasOutlet) {
    return (
      <div className="p-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
        {warningElement}
        <p className="text-gray-600 mt-4">Please select an outlet to view dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-2 sm:p-3">
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {currentOutlet.name} - Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome to your outlet dashboard.
          {currentOutlet.outlet_code && <span className="ml-2 text-xs font-medium text-primary-600">#{currentOutlet.outlet_code}</span>}
        </p>
      </div>
      
      {/* Navigation Cards */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Outlet Details Card */}
          <NavigationCard 
            title="Outlet Details" 
            description="View and manage details about your outlet" 
            icon={<FaStore size={24} />} 
            to="/outlet-details"
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
            buttonColor="bg-blue-600 hover:bg-blue-700"
          />
          
          {/* Statistics Card */}
          <NavigationCard 
            title="Statistics" 
            description="View comprehensive statistics and analytics" 
            icon={<FaChartBar size={24} />} 
            to="/statistics"
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
            buttonColor="bg-purple-600 hover:bg-purple-700"
          />
          
          {/* Compare Outlets Card */}
          <NavigationCard 
            title="Compare Outlets" 
            description="Compare performance metrics across outlets" 
            icon={<FaExchangeAlt size={24} />} 
            to="/compare-outlets"
            bgColor="bg-green-50"
            iconColor="text-green-600"
            buttonColor="bg-green-600 hover:bg-green-700"
          />
        </div>
      </div>
    </div>
  );
}

// Navigation Card Component
const NavigationCard = ({ title, description, icon, to, bgColor, iconColor, buttonColor }) => (
  <div className={`${bgColor} border border-gray-200 rounded-lg shadow-sm overflow-hidden`}>
    <div className="p-4">
      <div className="flex items-start mb-3">
        <div className={`p-2 rounded-full ${bgColor} ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <Link 
        to={to} 
        className={`mt-3 w-full flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${buttonColor}`}
      >
        Go to {title}
      </Link>
    </div>
  </div>
); 