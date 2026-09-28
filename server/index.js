const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const aiRoutes = require('./routes/ai');
const { ensureSchema } = require('./lib/db-setup');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (/^https:\/\/[a-z0-9.-]+\.vercel\.app$/.test(origin)) return cb(null, true);
      if (/^https:\/\/\d+-[a-z0-9]+\.e2b\.app$/.test(origin)) return cb(null, true);
      return cb(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    name: 'InternTrack',
    time: new Date().toISOString(),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/ai', aiRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`InternTrack API listening on ${PORT}`);
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const result = await ensureSchema();
      console.log('Schema check:', JSON.stringify(result));
    } catch (err) {
      console.error('Schema setup error:', err.message);
    }
  } else {
    console.log('Supabase env not set yet — skip schema setup.');
  }
});
