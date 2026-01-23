import React from 'react';

export default function Input({
  label,
  error,
  icon:  Icon,
  className = '',
  ... props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        )}
        <input
          className={`w-full px-4 py-2.5 ${Icon ? 'pl-10' :  ''} border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-smooth ${className} ${
            error ? 'border-red-500' : ''
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}