# 🏨 Hotel Ravel - Sistema de Gestión de Clientes

Sistema de gestión hotelera con CRUD completo para administrar clientes, reservaciones y habitaciones.

## 🚀 Tecnologías

- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (Supabase)
- **Frontend:** HTML, CSS, JavaScript vanilla

## 📋 Requisitos

- Node.js 18+
- Cuenta de Supabase (gratuita)

## ⚙️ Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/hotel-ravel.git
cd hotel-ravel
```

2. Instala dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

4. Edita `.env` con tu conexión de Supabase:
```
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

5. Inicializa la base de datos:
```bash
node setup.js
```

6. Inicia el servidor:
```bash
npm start
```

7. Abre http://localhost:3000

## 📁 Estructura

```
hotel-ravel/
├── app.js          # Frontend JavaScript
├── index.html      # Interfaz de usuario
├── styles.css      # Estilos
├── server.js       # API Express
├── setup.js        # Script de inicialización DB
├── database/
│   └── schema.sql  # Esquema de base de datos
└── package.json
```

## 🔗 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Obtener todos los clientes |
| GET | `/api/clientes/:id` | Obtener cliente por ID |
| POST | `/api/clientes` | Crear nuevo cliente |
| PUT | `/api/clientes/:id` | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente |

## 📄 Licencia

ISC
