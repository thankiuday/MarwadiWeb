import { createContext, useEffect, useState, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

const SOCKET_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000');

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRooms = useCallback(() => {
    if (!socket || !user) return;
    if (user.role === 'admin') {
      socket.emit('join_room', { room: 'admin_room' });
    } else if (user.role === 'superadmin') {
      socket.emit('join_room', { room: 'admin_room' });
      socket.emit('join_room', { room: 'superadmin_room' });
    } else {
      const room = `user_${String(user._id)}`;
      socket.emit('join_room', { room });
    }
  }, [socket, user]);

  useEffect(() => {
    joinRooms();
  }, [joinRooms]);

  useEffect(() => {
    if (!socket || !user) return;
    socket.on('connect', joinRooms);
    return () => socket.off('connect', joinRooms);
  }, [socket, user, joinRooms]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
