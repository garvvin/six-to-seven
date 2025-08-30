import React from 'react';

const Loading = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div 
      className="flex flex-col items-center justify-center space-y-4 p-8"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default Loading;
