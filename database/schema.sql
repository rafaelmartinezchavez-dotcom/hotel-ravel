-- =============================================
-- Hotel Ravel - Schema de Base de Datos
-- PostgreSQL 18
-- =============================================

-- Crear la base de datos (ejecutar como superusuario si no existe)
-- CREATE DATABASE hotel_ravel;

-- Conectar a la base de datos hotel_ravel antes de ejecutar lo siguiente
-- \c hotel_ravel

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
-- DATOS DE DEMOSTRACIÓN (opcional)
-- =============================================

INSERT INTO clientes (nombre, email, telefono, documento, habitacion, tipo_habitacion, check_in, check_out, estado, nacionalidad, notas)
VALUES 
    ('María García López', 'maria.garcia@email.com', '+52 55 1234 5678', 'MX-87654321', '301', 'suite', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days', 'activo', 'Mexicana', 'Solicita almohada extra.'),
    ('Carlos Martínez Ruiz', 'c.martinez@empresa.com', '+34 91 234 5678', 'ES-12345678A', '215', 'doble', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 'activo', 'Española', ''),
    ('Laura Fernández', 'laura.f@hotmail.com', '+52 33 9876 5432', 'MX-11223344', '412', 'individual', CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '7 days', 'reserva', 'Mexicana', 'Primer piso si es posible.'),
    ('James Wilson', 'jwilson@gmail.com', '+1 212 555 0199', 'US-A12345678', '505', 'familiar', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE, 'checkout', 'Estadounidense', 'Solicitó cuna extra.');

-- =============================================
-- VERIFICAR CREACIÓN
-- =============================================

-- SELECT * FROM clientes;
