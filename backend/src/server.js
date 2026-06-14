require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const initChatSocket = require('./sockets/chatSocket');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize database & Cloudinary
connectDB();
configureCloudinary();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initChatSocket(server);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows displaying local images
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate Limiting (Applied to all API requests)
app.use('/api', apiLimiter);

// Body Parsers
app.use(express.json({ limit: '10kb' })); // Prevents large payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Prevent NoSQL query injection
app.use(mongoSanitize());

// Ensure local uploads directory exists & serve static uploaded files
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Anurag Resell API is running'
  });
});
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Fallback Route for Undefined Paths
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized Error Handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
