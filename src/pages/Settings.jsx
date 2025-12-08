import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Mock user data
  const mockUser = {
    name: "Outlet Manager",
    email: "manager@menusmitra.com",
    phone: "+91 9876543210",
  };

  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    name: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    orderNotifications: true,
    statusUpdates: true,
    marketingEmails: false,
    appUpdates: true,
  });

  // App settings
  const [appSettings, setAppSettings] = useState({
    language: "english",
    theme: "light",
    autoRefresh: true,
    refreshInterval: 5, // minutes
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAppSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAppSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveSettings = () => {
    setIsSaving(true);
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage("Settings saved successfully");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    }, 1000);
  };

  const handleLogout = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">
          Manage your account and application preferences
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="h-5 w-5 text-green-400"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Profile Information
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileSettings.name}
              onChange={handleProfileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileSettings.email}
              onChange={handleProfileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={profileSettings.phone}
              onChange={handleProfileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="orderNotifications"
                name="orderNotifications"
                type="checkbox"
                checked={notificationSettings.orderNotifications}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="orderNotifications"
                className="font-medium text-gray-700"
              >
                Order Notifications
              </label>
              <p className="text-gray-500">
                Receive notifications for new orders and updates
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="statusUpdates"
                name="statusUpdates"
                type="checkbox"
                checked={notificationSettings.statusUpdates}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="statusUpdates"
                className="font-medium text-gray-700"
              >
                Status Updates
              </label>
              <p className="text-gray-500">
                Receive notifications about system status and maintenance
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="marketingEmails"
                name="marketingEmails"
                type="checkbox"
                checked={notificationSettings.marketingEmails}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="marketingEmails"
                className="font-medium text-gray-700"
              >
                Marketing Emails
              </label>
              <p className="text-gray-500">
                Receive updates about new features and promotions
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="appUpdates"
                name="appUpdates"
                type="checkbox"
                checked={notificationSettings.appUpdates}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="appUpdates" className="font-medium text-gray-700">
                App Updates
              </label>
              <p className="text-gray-500">
                Receive notifications when the app has new versions available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* App Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">App Settings</h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Language
            </label>
            <select
              id="language"
              name="language"
              value={appSettings.language}
              onChange={handleAppSettingChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="kannada">Kannada</option>
              <option value="tamil">Tamil</option>
              <option value="telugu">Telugu</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="theme"
              className="block text-sm font-medium text-gray-700"
            >
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              value={appSettings.theme}
              onChange={handleAppSettingChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="autoRefresh"
                name="autoRefresh"
                type="checkbox"
                checked={appSettings.autoRefresh}
                onChange={handleAppSettingChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="autoRefresh"
                className="font-medium text-gray-700"
              >
                Auto Refresh Dashboard
              </label>
              <p className="text-gray-500">
                Automatically refresh dashboard data
              </p>
            </div>
          </div>
          {appSettings.autoRefresh && (
            <div>
              <label
                htmlFor="refreshInterval"
                className="block text-sm font-medium text-gray-700"
              >
                Refresh Interval (minutes)
              </label>
              <select
                id="refreshInterval"
                name="refreshInterval"
                value={appSettings.refreshInterval}
                onChange={handleAppSettingChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="1">1 minute</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="px-4 py-2 bg-primary-600 text-white rounded-3xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
