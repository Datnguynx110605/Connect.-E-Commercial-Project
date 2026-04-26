import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) {
  return (
    <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
