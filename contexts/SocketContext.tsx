import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Notification, Message, TribeMessage } from '../types';
import { toast } from '../components/common/Toast';

const SOCKET_URL = 'http://localhost:5001'; // IMPORTANT: Change this for production

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  notifications: Notification[];
  unreadMessageCount: number;
  unreadTribeCount: number;
  unreadNotificationCount: number;
  unreadCounts: {
    messages: { [key: string]: number };
    tribes: { [key: string]: number };
  };
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [unreadCounts, setUnreadCounts] = useState<{
    messages: { [key: string]: number };
    tribes: { [key: string]: number };
  }>({ messages: {}, tribes: {} });

  useEffect(() => {
    if (currentUser) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: currentUser.id },
      });
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('getOnlineUsers', (users: string[]) => {
      setOnlineUsers(users);
    });

    socket.on('newNotification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        toast.info(
            `${notification.sender.name} ${notification.type === 'follow' ? 'started following you' : notification.type === 'like' ? 'liked your post' : 'commented on your post'}.`
        );
    });

    socket.on('newMessage', (message: Message) => {
        // This is a placeholder for incrementing unread counts.
        // The actual logic would depend on whether the chat window is active.
        // For simplicity, we manage counts globally here.
         setUnreadCounts(prev => ({
            ...prev,
            messages: {
                ...prev.messages,
                [message.senderId]: (prev.messages[message.senderId] || 0) + 1,
            }
        }));
    });

    socket.on('newTribeMessage', (message: TribeMessage) => {
        if(message.senderId !== currentUser?.id) {
            setUnreadCounts(prev => ({
                ...prev,
                tribes: {
                    ...prev.tribes,
                    [message.tribeId!]: (prev.tribes[message.tribeId!] || 0) + 1,
                }
            }));
        }
    });

    return () => {
      socket.off('connect');
      socket.off('getOnlineUsers');
      socket.off('newNotification');
      socket.off('newMessage');
      socket.off('newTribeMessage');
    };
  }, [socket, currentUser]);

  const unreadMessageCount = Object.values(unreadCounts.messages).reduce((sum, count) => sum + count, 0);
  const unreadTribeCount = Object.values(unreadCounts.tribes).reduce((sum, count) => sum + count, 0);
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications, unreadMessageCount, unreadTribeCount, unreadNotificationCount, unreadCounts }}>
      {children}
    </SocketContext.Provider>
  );
};
