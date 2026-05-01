import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface NotificationDto {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  payload: unknown | null;
}

interface NotificationContextType {
  notifications: NotificationDto[];
  unreadCount: number;
  clearUnread: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [toasts, setToasts] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

    const setupConnection = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      if (!connectionRef.current) {
        connectionRef.current = new signalR.HubConnectionBuilder()
          .withUrl(`${API_BASE_URL}/hubs/notifications`, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .build();
      }

      const connection = connectionRef.current;

      connection.off('ReceiveNotification');
      connection.on('ReceiveNotification', (dto: NotificationDto) => {
        if (!isMounted) return;
        setNotifications(prev => [dto, ...prev]);
        setToasts(prev => [...prev, dto]);
        setUnreadCount(prev => prev + 1);

        // Play sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Audio error:', e));
        }

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
          if (isMounted) {
            setToasts(prev => prev.filter(t => t.id !== dto.id));
          }
        }, 5000);
      });

      if (connection.state === signalR.HubConnectionState.Disconnected) {
        try {
          await connection.start();
        } catch (err: any) {
          if (isMounted && err.name !== 'AbortError') {
            console.error('SignalR Global Connection Error: ', err);
          }
        }
      }
    };

    setupConnection();

    return () => {
      isMounted = false;
      if (connectionRef.current) {
        // Only stop if we're not in the middle of a reconnection
        if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
           connectionRef.current.stop().catch(() => {});
        }
      }
    };
  }, []);

  const clearUnread = () => setUnreadCount(0);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, clearUnread }}>
      {children}
      
      {/* Global Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-80 pointer-events-auto flex gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <div className="mt-1">
                {toast.type === 'low_stock' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> :
                 toast.type === 'payment_success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> :
                 <Info className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{toast.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{toast.body}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
