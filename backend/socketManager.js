let onlineUsers = new Map(); // Map<userId, socketId>

export const initializeSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Listen for a user connecting
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is online.`);
    }

    // Broadcast the updated list of online users to everyone
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    
    // Heartbeat to keep connection alive on services like Render
    socket.on('ping', (callback) => {
        callback();
    });

    // Room joining/leaving
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        console.log(`${socket.id} joined room ${roomName}`);
    });
    
    socket.on('leaveRoom', (roomName) => {
        socket.leave(roomName);
        console.log(`${socket.id} left room ${roomName}`);
    });

    // Typing indicators
    socket.on('typing', ({ roomId, userName, userId }) => {
        socket.to(roomId).emit('userTyping', { userName, userId });
    });
    
    socket.on('stopTyping', ({ roomId, userName, userId }) => {
        socket.to(roomId).emit('userStoppedTyping', { userName, userId });
    });


    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      // Find which user disconnected and remove them
      for (let [key, value] of onlineUsers.entries()) {
        if (value === socket.id) {
          onlineUsers.delete(key);
          console.log(`User ${key} went offline.`);
          break;
        }
      }
      // Broadcast the new list of online users
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });
  
  return onlineUsers;
};
