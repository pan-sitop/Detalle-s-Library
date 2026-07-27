require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes'); 
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ────────────────────────────────────────
app.use(cors());           // Habilita CORS para todas las rutas
app.use(express.json());   // Parseo de JSON en el body de las peticiones

// ─── Rutas ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes); 

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Arranque del servidor ──────────────────────────────
async function startup() {
  try {
    await db.initialize();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

// ─── Apagado ordenado ───────────────────────────────────
async function shutdown() {
  console.log('\nApagando servidor...');
  await db.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startup();
