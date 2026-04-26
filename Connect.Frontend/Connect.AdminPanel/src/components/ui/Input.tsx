import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input 
        className={`px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 duration-200 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string, value: string | number }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select 
        className={`px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 duration-200 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
