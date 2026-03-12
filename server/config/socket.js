import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigin = isProd && !process.env.CLIENT_URL
    ? true
    : (process.env.CLIENT_URL || 'http://localhost:5173');
  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_room', ({ room }) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
