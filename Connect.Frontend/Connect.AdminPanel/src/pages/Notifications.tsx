import React, { useEffect } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';
import { useNotifications } from '../context/NotificationContext';

export function Notifications() {
  const { notifications, clearUnread } = useNotifications();

  useEffect(() => {
    clearUnread();
  }, [clearUnread]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'low_stock': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'payment_success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
           <Bell className="w-5 h-5 text-blue-500" /> Thông báo Hệ thống
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.length === 0 && (
          <div className="p-6 text-center text-slate-500">Chưa có thông báo nào.</div>
        )}
        {notifications.map(n => (
          <div key={n.id} className={cn("p-6 flex gap-4 transition-colors", "bg-white hover:bg-slate-50")}>
            <div className="mt-1">
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                 <h4 className="font-semibold text-slate-900">{n.title}</h4>
                 <span className="text-xs text-slate-500">{formatDate(n.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-600">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
