import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OutletHeader from './OutletHeader';
import OutletStatusBar from './common/OutletStatusBar';
import { useOutlet } from '../context/OutletContext';
import { useAuth } from '../context/AuthContext';
import DateRangePicker from './DateRangePicker';
import NotificationBell from './NotificationBell';

export default function Layout({ children }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const { currentOutlet } = useOutlet();
  const { logout } = useAuth();
  const [dateRange, setDateRange] = useState({ type: 'all' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const userName = localStorage.getItem('user_name') || 'User';
  const role = localStorage.getItem('role') || 'User';

  // Listen for outlet changes to reset date filter
  useEffect(() => {
    if (currentOutlet) {
      setDateRange({ type: 'all' });
      // Dispatch event to notify other components
      const event = new CustomEvent('daterange:changed', { detail: { type: 'all' } });
      window.dispatchEvent(event);
    }
  }, [currentOutlet?.outlet_id]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleReportsMenu = () => {
    setReportsOpen(!reportsOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Dispatch a custom event that components can listen for
    const event = new CustomEvent('daterange:changed', { detail: range });
    window.dispatchEvent(event);
  };
  
  const handleRefresh = () => {
    // Start the refresh animation
    setIsRefreshing(true);
    
    // Implement refresh logic here
    window.location.reload();
  };

  // Check if current page is Statistics
  const isStatisticsPage = location.pathname === '/statistics';

  const navigationItems = [
    { name: 'Home', path: '/', icon: 'store' },
    { name: 'Statistics', path: '/statistics', icon: 'bar-chart' },
    { name: 'Outlet Details', path: '/outlet-details', icon: 'store' },
    { name: 'Compare Outlets', path: '/compare-outlets', icon: 'compare' },
    // { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  const reportItems = [
    { name: 'Orders', path: '/reports/orders', icon: 'document' },
    { name: 'Customers', path: '/reports/customers', icon: 'users' },
    { name: 'Menu', path: '/reports/menu', icon: 'menu' },
    { name: 'Inventory', path: '/reports/inventory', icon: 'box' },
    { name: 'Staff', path: '/reports/staff', icon: 'users' },
    { name: 'Tables', path: '/reports/tables', icon: 'table' },
    { name: 'Split Tables', path: '/reports/split-tables', icon: 'split-table' },
    { name: 'Join Tables', path: '/reports/join-tables', icon: 'join-table' },
    { name: 'Coupons', path: '/reports/coupons', icon: 'tag' },
    { name: 'Payments', path: '/reports/payments', icon: 'currency' },
    { name: 'Order Status', path: '/reports/order-status', icon: 'clock' }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Testing Environment Bar - fixed at the top */}
      <div className="bg-yellow-500 text-white text-center py-1 px-2 font-medium w-full sticky top-0 z-[9999] flex items-center justify-center h-7">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Testing Environment</span>
      </div>
      
      {/* Main content wrapper - takes remaining height */}
      <div className="flex flex-1 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header/Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center">
              <img
                  src="/assets/MenuMitra_logo.png"
                alt="MenuMitra Logo"
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold text-gray-800">MenuMitra</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                      onClick={() => setIsSidebarOpen(false)}
                  >
                    <SidebarIcon name={item.icon} />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
              
              {/* Reports Menu with Dropdown */}
              <li>
                <button
                  onClick={toggleReportsMenu}
                  className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    location.pathname.startsWith('/reports')
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <SidebarIcon name="reports" />
                    <span className="ml-3">Reports</span>
                  </div>
                  <svg
                    className={`h-4 w-4 transition-transform ${
                      reportsOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                
                {/* Reports Submenu */}
                {reportsOpen && (
                  <ul className="mt-1 pl-6 space-y-1">
                    {reportItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            location.pathname === item.path
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                            onClick={() => setIsSidebarOpen(false)}
                        >
                          <SidebarIcon name={item.icon} />
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </nav>
            
            {/* Logout Button at bottom of sidebar - only visible on mobile */}
            <div className="border-t border-gray-200 p-4 md:hidden mt-auto">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Outlet Selector */}
        <header className="bg-white z-10 shadow-sm">
            <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            <div className="flex-1">
              <OutletHeader />
            </div>

            {/* User menu and notification bell */}
            {/* <div className="flex items-center gap-4">
              <NotificationBell />
              
           
            </div> */}
          </div>
          
          {/* Mobile Date Filter and Refresh Button - only visible on mobile */}
          {currentOutlet && (
            <div className="md:hidden flex items-center justify-end gap-3 py-2 px-4">
              <button 
                onClick={handleRefresh}
                className="h-9 w-9 flex items-center justify-center rounded-md text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none"
                title="Refresh"
                disabled={isRefreshing}
              >
                <svg 
                  className={`h-5 w-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`}
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              
              <div>
                <DateRangePicker 
                  onChange={isStatisticsPage ? handleDateRangeChange : undefined} 
                  initialValue="all" 
                  disabled={!isStatisticsPage}
                />
              </div>
            </div>
          )}
          
          {/* Outlet Status Bar - shows on all pages */}
          <OutletStatusBar />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
        </div>
      </div>
    </div>
  );
}

// Icons for the sidebar
function SidebarIcon({ name }) {
  switch (name) {
    case 'home':
      return (
        <i className="fa-solid fa-house"></i>
      );
    case 'bar-chart':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      );
    case 'store':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      );
    case 'compare':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    case 'settings':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    case 'reports':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'document':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'users':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      );
    case 'menu':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      );
    case 'box':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      );
    case 'table':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    case 'tag':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      );
    case 'currency':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'clock':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'split-table':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H5a2 2 0 00-2 2v10a2 2 0 002 2h4v-5m0-9v5m0 0h6m-6 0l6-5m6 0v10a2 2 0 01-2 2h-4"
          />
        </svg>
      );
    case 'join-table':
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H5a2 2 0 00-2 2v10a2 2 0 002 2h4M19 5h-4m4 0v14h-4m-6-9h10"
          />
        </svg>
      );
    default:
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      );
  }
} 