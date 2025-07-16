import React from 'react';

// Custom toast component for react-toastify
const CustomToast = ({ title, message, type }) => {
  // Get toast style based on notification type
  const getToastStyle = () => {
    // Normalize type to lowercase for case-insensitive comparison
    const normalizedType = (type || 'info').toLowerCase();

    switch (normalizedType) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-100 via-green-50 to-emerald-50',
          border: 'border-l-[4px] border-green-500',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-100 via-blue-50 to-sky-50',
          border: 'border-l-[4px] border-blue-500',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'order':
        return {
          bg: 'bg-gradient-to-r from-cyan-100 via-cyan-50 to-blue-50',
          border: 'border-l-[4px] border-cyan-500',
          iconBg: 'bg-cyan-100',
          iconColor: 'text-cyan-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        };
      case 'payment':
        return {
          bg: 'bg-gradient-to-r from-indigo-100 via-indigo-50 to-blue-50',
          border: 'border-l-[4px] border-indigo-500',
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'offer':
        return {
          bg: 'bg-gradient-to-r from-purple-100 via-purple-50 to-fuchsia-50',
          border: 'border-l-[4px] border-purple-500',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          )
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-100 via-amber-50 to-yellow-50',
          border: 'border-l-[4px] border-amber-500',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        };
      case 'error':
      case 'danger':
      case 'alert':
        return {
          bg: 'bg-gradient-to-r from-rose-100 via-rose-50 to-red-50',
          border: 'border-l-[4px] border-rose-500',
          iconBg: 'bg-rose-100',
          iconColor: 'text-rose-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'table':
        return {
          bg: 'bg-gradient-to-r from-teal-100 via-teal-50 to-emerald-50',
          border: 'border-l-[4px] border-teal-500',
          iconBg: 'bg-teal-100',
          iconColor: 'text-teal-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          )
        };
      case 'menu':
        return {
          bg: 'bg-gradient-to-r from-emerald-100 via-emerald-50 to-green-50',
          border: 'border-l-[4px] border-emerald-500',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-100 via-gray-50 to-slate-50',
          border: 'border-l-[4px] border-gray-400',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          icon: (
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  // Get gradient class based on notification type
  const getGradientClass = (type) => {
    const normalizedType = (type || 'info').toLowerCase();
    
    switch (normalizedType) {
      case 'success':
        return 'success-gradient-bg';
      case 'info':
        return 'info-gradient-bg';
      case 'offer':
        return 'offer-gradient-bg';
      case 'warning':
        return 'warning-gradient-bg';
      case 'error':
      case 'danger':
      case 'alert':
        return 'danger-gradient-bg';
      case 'order':
        return 'order-gradient-bg';
      case 'payment':
        return 'payment-gradient-bg';
      default:
        return 'info-gradient-bg';
    }
  };

  // Get shadow class based on notification type
  const getShadowClass = (type) => {
    const normalizedType = (type || 'info').toLowerCase();
    
    switch (normalizedType) {
      case 'success':
        return 'shadow-[0_8px_30px_rgba(74,222,128,0.15)]';
      case 'info':
        return 'shadow-[0_8px_30px_rgba(96,165,250,0.15)]';
      case 'offer':
        return 'shadow-[0_8px_30px_rgba(192,132,252,0.15)]';
      case 'warning':
        return 'shadow-[0_8px_30px_rgba(251,191,36,0.15)]';
      case 'error':
      case 'danger':
      case 'alert':
        return 'shadow-[0_8px_30px_rgba(248,113,113,0.15)]';
      case 'order':
        return 'shadow-[0_8px_30px_rgba(34,211,238,0.15)]';
      case 'payment':
        return 'shadow-[0_8px_30px_rgba(129,140,248,0.15)]';
      default:
        return 'shadow-[0_8px_30px_rgba(0,0,0,0.1)]';
    }
  };

  const style = getToastStyle();
  const gradientClass = getGradientClass(type);
  const shadowClass = getShadowClass(type);

  return (
    <div className={`w-full flex items-center py-3 px-4 pr-10 ${gradientClass} ${style.border} rounded-md ${shadowClass}`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-full bg-white/80 ${style.iconColor} flex items-center justify-center`}>
        {style.icon}
      </div>
      <div className="ml-3 flex-1">
        {title && title.trim() !== '' && (
          <div className="text-sm font-semibold text-gray-900">{title}</div>
        )}
        {message && <div className="text-sm font-medium text-gray-800">{message}</div>}
      </div>
    </div>
  );
};

export default CustomToast; 