import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  multiline?: boolean;
}

export function Input({ label, error, className = '', multiline, ...props }: InputProps) {
  const baseClass = `px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 duration-200 w-full ${
    error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
  } ${className}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      {multiline ? (
        <textarea
          className={`${baseClass} resize-none min-h-[80px]`}
          value={props.value as string}
          onChange={props.onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
          placeholder={props.placeholder}
          required={props.required}
          disabled={props.disabled}
          rows={3}
        />
      ) : (
        <input className={baseClass} {...props} />
      )}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 duration-200 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}