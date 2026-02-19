/* =============================================
   Hotel Ravel - Database Setup
   Initialize schema in Neon PostgreSQL
   ============================================= */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const setupSQL = `
-- =============================================
-- TABLA: clientes
-- =============================================

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefono VARCHAR(50),
    documento VARCHAR(50),
    habitacion VARCHAR(20),
    tipo_habitacion VARCHAR(50) DEFAULT 'doble',
    check_in DATE,
    check_out DATE,
    estado VARCHAR(20) DEFAULT 'activo',
    nacionalidad VARCHAR(100),
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES para mejorar rendimiento
-- =============================================

CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_habitacion ON clientes(habitacion);
CREATE INDEX IF NOT EXISTS idx_clientes_check_in ON clientes(check_in);
CREATE INDEX IF NOT EXISTS idx_clientes_check_out ON clientes(check_out);

-- =============================================
-- DATOS DE DEMOSTRACIÓN
-- =============================================

INSERT INTO clientes (nombre, email, telefono, documento, habitacion, tipo_habitacion, check_in, check_out, estado, nacionalidad, notas)
VALUES 
    ('María García López', 'maria.garcia@email.com', '+52 55 1234 5678', 'MX-87654321', '301', 'suite', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days', 'activo', 'Mexicana', 'Solicita almohada extra.')
ON CONFLICT DO NOTHING;

INSERT INTO clientes (nombre, email, telefono, documento, habitacion, tipo_habitacion, check_in, check_out, estado, nacionalidad, notas)
VALUES 
    ('Carlos Martínez Ruiz', 'c.martinez@empresa.com', '+34 91 234 5678', 'ES-12345678A', '215', 'doble', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 'activo', 'Española', '')
ON CONFLICT DO NOTHING;

INSERT INTO clientes (nombre, email, telefono, documento, habitacion, tipo_habitacion, check_in, check_out, estado, nacionalidad, notas)
VALUES 
    ('Laura Fernández', 'laura.f@hotmail.com', '+52 33 9876 5432', 'MX-11223344', '412', 'individual', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '7 days', 'reserva', 'Mexicana', 'Primer piso si es posible.')
ON CONFLICT DO NOTHING;

INSERT INTO clientes (nombre, email, telefono, documento, habitacion, tipo_habitacion, check_in, check_out, estado, nacionalidad, notas)
VALUES 
    ('James Wilson', 'jwilson@gmail.com', '+1 212 555 0199', 'US-A12345678', '505', 'familiar', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE, 'checkout', 'Estadounidense', 'Solicitó cuna extra.')
ON CONFLICT DO NOTHING;
`;

async function setup() {
  const client = await pool.connect();
  try {
    console.log('🔧 Inicializando base de datos en Neon...');
    
    // Split by semicolons and execute each statement
    const statements = setupSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log('✅ Ejecutado:', statement.substring(0, 60) + '...');
      } catch (err) {
        // Ignore "already exists" errors
        if (!err.message.includes('already exists')) {
          throw err;
        }
      }
    }
    
    console.log('\n✅ Base de datos configurada exitosamente!')
    console.log('📊 Verificando datos...');
    
    const result = await client.query('SELECT COUNT(*) as total FROM clientes');
    console.log(`📌 Total de clientes en base de datos: ${result.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error durante setup:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
