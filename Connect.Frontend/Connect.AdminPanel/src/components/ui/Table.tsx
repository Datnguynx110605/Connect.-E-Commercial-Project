import React from 'react';

export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`w-full overflow-auto rounded-xl border border-gray-200 bg-white ${className}`}>
      <table className="w-full text-sm text-left">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">{children}</thead>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <tr className={`hover:bg-gray-50 transition-colors ${className}`}>{children}</tr>;
}

export function TableCell({ children, className = '', isHeader = false }: { children: React.ReactNode, className?: string, isHeader?: boolean }) {
  const Component = isHeader ? 'th' : 'td';
  const headerClasses = isHeader ? 'px-6 py-4 font-semibold tracking-wider text-gray-500' : 'px-6 py-4 text-gray-700 whitespace-nowrap';
  return <Component className={`${headerClasses} ${className}`}>{children}</Component>;
}
