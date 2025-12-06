import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationsService } from '@/services/notifications';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    try {
      const { data, error } = await notificationsService.fetchUnreadCount(user.id);
      if (error) {
        console.error('Error fetching unread count:', error);
        return;
      }
      if (data !== null) {
        setUnreadCount(data);
      }
    } catch (error) {
      console.error('Error in refreshUnreadCount:', error);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [user?.id]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
