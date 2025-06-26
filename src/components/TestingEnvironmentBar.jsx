import React from 'react';

const TestingEnvironmentBar = () => {
  return (
    <div className="bg-yellow-500 text-white text-center py-1 px-2 font-medium w-full sticky top-0 z-50 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Testing Environment</span>
    </div>
  );
};

export default TestingEnvironmentBar; 