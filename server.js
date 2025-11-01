const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const startServer = async () => {
    // Load environment variables
    dotenv.config();

    // Connect to database and wait for it to succeed before proceeding
    await connectDB();

    const app = express();

    // Middleware
    // CORS configuration - Allow specific origins for security
    // In development, allow all localhost origins for flexibility
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    app.use(cors({
        origin: function (origin, callback) {
            // In development, allow all localhost ports
            if (isDevelopment && (!origin || origin.includes('localhost') || origin.includes('127.0.0.1'))) {
                return callback(null, true);
            }
            
            // In production, check allowed origins
            if (process.env.FRONTEND_URL) {
                const allowedOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim());
                if (!origin || allowedOrigins.includes(origin)) {
                    return callback(null, true);
                }
            }
            
            // Allow requests with no origin in development (like Postman)
            if (isDevelopment && !origin) {
                return callback(null, true);
            }
            
            callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true, // Allow cookies/auth headers
    }));
    app.use(express.json()); // To accept JSON data in the body

    // Define routes
    app.get('/', (req, res) => {
        res.send('Helios API is running...');
    });

    app.use('/api/auth', require('./routes/api/auth'));
    app.use('/api/chat', require('./routes/api/chat'));


    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
};

startServer().catch(err => {
    console.error("Failed to start the server:", err);
    process.exit(1);
});