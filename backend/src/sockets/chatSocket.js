const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const initChatSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT Middleware for Socket.io verification
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_123456789');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected to chat socket: ${socket.userId} (Socket ID: ${socket.id})`);

    // Client requests to join a chat room
    socket.on('join_room', ({ chatId }) => {
      socket.join(chatId);
      console.log(`Socket user ${socket.userId} joined room: ${chatId}`);
    });

    // Client sends message
    socket.on('send_message', async ({ chatId, content }) => {
      try {
        if (!content || content.trim().length === 0) return;

        // Confirm chat room exists and sender is participant
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        if (chat.buyer.toString() !== socket.userId && chat.seller.toString() !== socket.userId) {
          console.log(`Unauthorized message attempt by ${socket.userId} in room ${chatId}`);
          return;
        }

        // Save message to DB
        let message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content: content.trim(),
        });

        message = await Message.findById(message._id).populate('sender', 'name profilePicture');

        // Update chat metadata
        chat.lastMessage = message._id;
        // Mongoose updates updatedAt automatically since timestamps is true, but we force save
        await chat.save();

        // Broadcast to specific room
        io.to(chatId).emit('receive_message', message);

        // Notify client lists of new messages (for real-time unread/preview notifications)
        io.emit(`chat_list_update_${chat.buyer}`, { chatId });
        io.emit(`chat_list_update_${chat.seller}`, { chatId });

      } catch (err) {
        console.error('Socket error in send_message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected from socket: ${socket.userId}`);
    });
  });

  return io;
};

module.exports = initChatSocket;
