import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message, title }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, [removeNotification]);

  const success = useCallback((msg: string, t?: string) => showNotification('success', msg, t), [showNotification]);
  const error = useCallback((msg: string, t?: string) => showNotification('error', msg, t), [showNotification]);
  const warning = useCallback((msg: string, t?: string) => showNotification('warning', msg, t), [showNotification]);
  const info = useCallback((msg: string, t?: string) => showNotification('info', msg, t), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

const NotificationToast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: 'border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/10',
    error: 'border-rose-500/20 bg-rose-500/10 shadow-rose-500/10',
    warning: 'border-amber-500/20 bg-amber-500/10 shadow-amber-500/10',
    info: 'border-blue-500/20 bg-blue-500/10 shadow-blue-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
      className={`pointer-events-auto min-w-[320px] max-w-[400px] overflow-hidden rounded-2xl border backdrop-blur-md p-4 shadow-2xl ${colors[notification.type]}`}
    >
      <div className="flex gap-3">
        <div className="shrink-0 pt-0.5">{icons[notification.type]}</div>
        <div className="flex-1">
          {notification.title && (
            <h4 className="text-sm font-semibold text-white/90 mb-1">{notification.title}</h4>
          )}
          <p className="text-sm text-white/70 leading-relaxed">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 w-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 5, ease: 'linear' }}
          className="h-full bg-white/40"
        />
      </div>
    </motion.div>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
