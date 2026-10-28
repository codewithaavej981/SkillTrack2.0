const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const skillRoutes = require('./routes/skillRoutes');
const goalRoutes = require('./routes/goalRoutes');
const learningRoutes = require("./routes/learningRoutes");
const analyticsRoutes = require('./routes/analyticsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

const clientUrlEnv = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientUrlEnv
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      const normalized = origin.replace(/\/+$/, '');
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillTrack 2.0 API is running',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillTrack 2.0 API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/goals', goalRoutes);
app.use("/api/learning", learningRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start because MongoDB could not connect.');
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
