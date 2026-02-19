/* =============================================
   Hotel Ravel - Backend Server
   Express + PostgreSQL
   ============================================= */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL Connection Pool - Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a Supabase PostgreSQL:', err.message);
  } else {
    console.log('✅ Conectado a Supabase PostgreSQL');
    release();
  }
});

// ============================================
// API ROUTES - CLIENTES
// ============================================

// GET - Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, email, telefono, documento, habitacion, 
             tipo_habitacion AS "tipoHabitacion", 
             TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
             TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
             estado, nacionalidad, notas, 
             creado_en AS "creadoEn"
      FROM clientes 
      ORDER BY creado_en DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET - Obtener un cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, nombre, email, telefono, documento, habitacion, 
             tipo_habitacion AS "tipoHabitacion", 
             TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
             TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
             estado, nacionalidad, notas, 
             creado_en AS "creadoEn"
      FROM clientes 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// POST - Crear nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const { 
      nombre, email, telefono, documento, habitacion, 
      tipoHabitacion, checkIn, checkOut, estado, nacionalidad, notas 
    } = req.body;

    const result = await pool.query(`
      INSERT INTO clientes (
        nombre, email, telefono, documento, habitacion, 
        tipo_habitacion, check_in, check_out, estado, nacionalidad, notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, nombre, email, telefono, documento, habitacion, 
                tipo_habitacion AS "tipoHabitacion", 
                TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
                TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
                estado, nacionalidad, notas, 
                creado_en AS "creadoEn"
    `, [nombre, email, telefono, documento, habitacion, 
        tipoHabitacion, checkIn || null, checkOut || null, 
        estado || 'activo', nacionalidad, notas]);

    console.log('✅ Cliente creado:', nombre);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT - Actualizar cliente
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, email, telefono, documento, habitacion, 
      tipoHabitacion, checkIn, checkOut, estado, nacionalidad, notas 
    } = req.body;

    const result = await pool.query(`
      UPDATE clientes SET 
        nombre = $1, email = $2, telefono = $3, documento = $4, 
        habitacion = $5, tipo_habitacion = $6, check_in = $7, 
        check_out = $8, estado = $9, nacionalidad = $10, notas = $11
      WHERE id = $12
      RETURNING id, nombre, email, telefono, documento, habitacion, 
                tipo_habitacion AS "tipoHabitacion", 
                TO_CHAR(check_in, 'YYYY-MM-DD') AS "checkIn",
                TO_CHAR(check_out, 'YYYY-MM-DD') AS "checkOut",
                estado, nacionalidad, notas, 
                creado_en AS "creadoEn"
    `, [nombre, email, telefono, documento, habitacion, 
        tipoHabitacion, checkIn || null, checkOut || null, 
        estado, nacionalidad, notas, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    console.log('✅ Cliente actualizado:', nombre);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE - Eliminar cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM clientes WHERE id = $1 RETURNING nombre', 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    console.log('🗑️ Cliente eliminado:', result.rows[0].nombre);
    res.json({ success: true, message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// ============================================
// ESTADÍSTICAS
// ============================================

app.get('/api/estadisticas', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM clientes');
    const hoyResult = await pool.query(`
      SELECT COUNT(*) FROM clientes 
      WHERE DATE(creado_en) = CURRENT_DATE
    `);

    res.json({
      totalClientes: parseInt(totalResult.rows[0].count),
      clientesHoy: parseInt(hoyResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ============================================
// SERVE FRONTEND
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║         🏨 HOTEL RAVEL - SERVER                   ║
╠═══════════════════════════════════════════════════╣
║  Servidor corriendo en: http://localhost:${PORT}      ║
║  Base de datos: PostgreSQL                        ║
╚═══════════════════════════════════════════════════╝
  `);
});
