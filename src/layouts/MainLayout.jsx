import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';


export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/orders', label: 'Orders', icon: '📋' },
    { path: '/menu', label: 'Menu', icon: '🍽️' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`bg-white border-r border-gray-200 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {isSidebarOpen && (
            <h1 className="text-xl font-semibold text-gray-800">Outlet Dashboard</h1>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isSidebarOpen && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {isSidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-500 hover:text-primary-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {menuItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h2>
        </header>

        {/* Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
} 