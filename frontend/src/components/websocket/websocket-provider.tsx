'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import toast from 'react-hot-toast';
import { BellIcon } from '@/components/ui/emoji-icons';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface LiveSocialProof {
  productId: string;
  productName: string;
  action: 'purchase' | 'view' | 'add_to_cart' | 'wishlist';
  userName: string;
  timestamp: string;
}

interface WebSocketContextType {
  connected: boolean;
  notifications: Notification[];
  socialProofFeed: LiveSocialProof[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  notifications: [],
  socialProofFeed: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllRead: () => {},
});

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { connected, subscribe } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socialProofFeed, setSocialProofFeed] = useState<LiveSocialProof[]>([]);

  useEffect(() => {
    const unsubNotif = subscribe('notification', (data) => {
      const notif = data.data as Notification;
      if (notif?.title) {
        setNotifications((prev) => [notif, ...prev].slice(0, 50));
        toast(notif.title, {
          icon: <BellIcon size={14} />,
          duration: 4000,
        });
      }
    });

    const unsubSocial = subscribe('social_proof', (data) => {
      const proof = data.data as LiveSocialProof;
      if (proof?.productName) {
        setSocialProofFeed((prev) => [proof, ...prev].slice(0, 20));
      }
    });

    return () => {
      unsubNotif();
      unsubSocial();
    };
  }, [subscribe]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        notifications,
        socialProofFeed,
        unreadCount,
        markAsRead,
        markAllRead,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
