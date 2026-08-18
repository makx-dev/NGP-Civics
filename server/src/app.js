const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { apiLimiter } = require('./middleware/rateLimiters');
const { pingDatabase } = require('./utils/mongoPing');

const app = express();

const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.set('trust proxy', 1);

// Ping endpoint specifically to ping MongoDB and keep it awake
app.get('/api/ping', async (_req, res) => {
  const dbStatus = await pingDatabase();
  const statusCode = dbStatus.ok ? 200 : 503;
  return res.status(statusCode).json({
    status: dbStatus.ok ? 'ok' : 'degraded',
    message: dbStatus.ok ? 'MongoDB server is awake and responsive' : 'MongoDB ping failed',
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Comprehensive health check route
app.get('/api/health', async (_req, res) => {
  const dbStatus = await pingDatabase();
  const statusCode = dbStatus.ok ? 200 : 503;
  return res.status(statusCode).json({
    status: dbStatus.ok ? 'ok' : 'degraded',
    service: 'NGP Civics API',
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiLimiter);

app.get('/api', (_req, res) => {
  res.json({ status: 'ok', service: 'NGP Civics API', baseUrl: '/api' });
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'NGP Civics API', baseUrl: '/' });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

/**
 * Serve React SPA and enable client-side routing on refresh.
 * - /api/* keeps returning JSON 404 (below).
 * - Any other GET path returns client/dist/index.html
 */
app.use(express.static(clientDistPath));

// Express v5 + path-to-regexp can throw on wildcard routes like `*`.
// Use an explicit regex-based fallback instead.
app.get(/^(?!\/api\/).*/, (_req, res, next) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) return next(err);
  });
});


// API 404 for unknown routes
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Route not found' });
  }
  return res.sendStatus(404);
});


module.exports = app;
