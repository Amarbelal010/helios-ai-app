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
    


    app.use(
      cors({
        origin: function (origin, callback) {
          const allowedOrigins = [
            "http://localhost:3000",       // وقت التطوير
            "https://helios-ai-app.vercel.app", // مثال لنشر الفرونت على Vercel
            "https://your-frontend-domain.com"  // غيّرها لدومينك الفعلي لما ترفعه
          ];
    
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("CORS blocked"));
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
      })
    );

    
    // Handle preflight
    app.options('*', cors());

    // Define routes
    app.get('/', (req, res) => {
        res.json({ 
            message: 'Helios API is running...',
            version: '1.0.0',
            endpoints: {
                auth: '/api/auth',
                chat: '/api/chat'
            }
        });
    });

    // API info endpoint
    app.get('/api', (req, res) => {
        res.json({
            message: 'Helios API',
            version: '1.0.0',
            status: 'online',
            endpoints: {
                auth: {
                    register: 'POST /api/auth/register',
                    login: 'POST /api/auth/login',
                    me: 'GET /api/auth/me'
                },
                chat: {
                    list: 'GET /api/chat',
                    create: 'POST /api/chat',
                    getById: 'GET /api/chat/:id',
                    update: 'PUT /api/chat/:id',
                    delete: 'DELETE /api/chat/:id',
                    sendMessage: 'POST /api/chat/:id/messages'
                }
            }
        });
    });

    // Health check endpoint for deployment platforms
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    app.use('/api/auth', require('./routes/api/auth'));
    app.use('/api/chat', require('./routes/api/chat'));

    // 404 handler for undefined routes
    app.use((req, res) => {
        res.status(404).json({
            error: 'Route not found',
            path: req.path,
            method: req.method,
            message: 'The requested endpoint does not exist. Check /api for available endpoints.'
        });
    });


    const PORT = process.env.PORT || 5000;
    const HOST = process.env.HOST || '0.0.0.0';

    app.listen(PORT, HOST, () => {
        console.log(`🚀 Helios API Server started on http://${HOST}:${PORT}`);
        console.log(`📡 API Info: http://${HOST}:${PORT}/api`);
        console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
    });
};

startServer().catch(err => {
    console.error("Failed to start the server:", err);
    process.exit(1);
});
