const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger/swagger');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi CORS untuk mengizinkan semua origin
app.use(cors({
  origin: '*', // Mengizinkan semua origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Mengizinkan semua method HTTP
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Mengizinkan header yang umum digunakan
  credentials: true // Mengizinkan credentials (cookies, authorization headers, dll)
}));

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// Serve static files dengan akses publik
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*'); // Mengizinkan akses file statis dari semua origin
    res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // Mengizinkan resource sharing
  }
}));

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Pre-flight request handler untuk semua route
app.options('*', cors()); // Mengizinkan pre-flight request untuk semua route

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HausJogja API' });
});

// Error handling middleware dengan CORS headers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.header('Access-Control-Allow-Origin', '*'); // Menambahkan CORS header pada error response
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong on the server',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;