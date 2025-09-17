// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import { createServer } from 'http';
// import { Server } from 'socket.io';
// import connectDB from './config/db.js';

// import authRoutes from './routes/authRoutes.js';
// import postRoutes from './routes/postRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import messageRoutes from './routes/messageRoutes.js';
// import tribeRoutes from './routes/tribeRoutes.js';
// import notificationRoutes from './routes/notificationRoutes.js';
// import { initializeSocket } from './socketManager.js';

// dotenv.config();
// connectDB();

// const app = express();
// const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   pingTimeout: 60000, // 60 seconds
//   cors: {
//     origin: "*", // IMPORTANT: In production, change this to your frontend's URL
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   },
// });

// // Make io instance available in the app
// app.set('io', io);

// // Initialize Socket.IO connection handling
// const onlineUsers = initializeSocket(io);

// app.use(cors());
// app.use(express.json({ limit: '50mb' }));

// // Middleware to attach io and onlineUsers to each request
// app.use((req, res, next) => {
//     req.io = io;
//     req.onlineUsers = onlineUsers;
//     next();
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/messages', messageRoutes);
// app.use('/api/tribes', tribeRoutes);
// app.use('/api/notifications', notificationRoutes);

// app.get('/', (req, res) => {
//   res.send('Tribe API is running...');
// });

// const PORT = process.env.PORT || 5001;
// httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));






import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import tribeRoutes from './routes/tribeRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { initializeSocket } from './socketManager.js';

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const app = express();
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      pingTimeout: 60000,
      cors: {
        origin: "*", // In production, change this to your frontend's URL
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });

    app.set('io', io);
    const onlineUsers = initializeSocket(io);

    app.use(cors());
    app.use(express.json({ limit: '50mb' }));

    app.use((req, res, next) => {
      req.io = io;
      req.onlineUsers = onlineUsers;
      next();
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/tribes', tribeRoutes);
    app.use('/api/notifications', notificationRoutes);

    app.get('/', (req, res) => {
      res.send('Tribe API is running...');
    });

    const PORT = process.env.PORT || 5001;
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
