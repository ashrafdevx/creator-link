import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getTokens } from '@/utils/tokenStorage';

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const tokens = getTokens();

    if (!tokens || !tokens.accessToken) {
      return;
    }

    // Initialize socket connection if not already connected
    if (!socket) {
      socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000', {
        auth: {
          token: tokens.accessToken
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socket.on('connect', () => {
        console.log('✅ Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on component unmount, keep connection alive
      // Only disconnect when user logs out or app closes
    };
  }, []);

  return { socket, isConnected };
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
