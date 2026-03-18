# HUSRT Biomedica — Sistema de Gestión de Equipos Biomédicos

Sistema web full-stack desarrollado para el **Hospital Universitario San Rafael de Tunja (HUSRT)**, orientado a la gestión integral de equipos biomédicos, mantenimiento, metrología y soporte técnico interno.

---

## Módulos principales

| Módulo | Descripción |
|--------|-------------|
| **Biomédica** | Inventario de equipos, ciclo de vida, mantenimiento preventivo y correctivo, metrología, trazabilidad y reportes |
| **Mesa de Servicios** | Gestión de tickets y casos de soporte interno por categoría y rol |
| **Sistemas** | Módulo espejo para gestión de equipos del área de sistemas |
| **Administración** | Usuarios, roles, fabricantes, proveedores, sedes, servicios y clasificaciones |

---

## Stack tecnológico

### Frontend — Angular 19
- Angular 19.2 + Angular Material + PrimeNG + Bootstrap 5
- Chart.js (dashboards), jsPDF + ExcelJS (reportes), @zxing (QR/código de barras)
- Autenticación JWT con guards y RBAC

### Backend — Node.js + Express
- Express 4 + Sequelize 6 (ORM)
- Base de datos: **MariaDB** (compatible MySQL)
- JWT + bcryptjs (autenticación y hash de contraseñas)
- Multer (carga de archivos), Nodemailer (correos), PDFKit (generación PDF)

---

## Requisitos previos

- Node.js >= 18.x
- Angular CLI >= 19.x (`npm install -g @angular/cli`)
- MariaDB o MySQL >= 10.x
- Git

---

## Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd "Nuevo aplicativo"
```

### 2. Configurar el Backend

```bash
cd NodeBackendProyectHusrt-biomedica-general

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
```

Editar `.env` con los datos reales:

```env
DB_NAME=nombre_base_de_datos
DB_USER=usuario_db
DB_PASSWORD=contraseña_segura
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=cadena_aleatoria_larga_y_segura
PORT=3005
```

> **Nota:** Para generar un `JWT_SECRET` seguro puedes usar:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Iniciar el servidor:

```bash
npm run dev      # desarrollo (nodemon)
npm start        # producción
```

El servidor queda disponible en `http://localhost:3005`

### 3. Configurar el Frontend

```bash
cd FrontAppHusrt-biomedica-general

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
```

La aplicación queda disponible en `http://localhost:4200`

---

## Variables de entorno (Backend)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_NAME` | Nombre de la base de datos | `husrt_biomedica` |
| `DB_USER` | Usuario de MariaDB/MySQL | `app_user` |
| `DB_PASSWORD` | Contraseña del usuario | — |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `3306` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | — |
| `PORT` | Puerto del servidor Express | `3005` |

---

## Roles del sistema

| Rol | Acceso |
|-----|--------|
| `SuperAdmin` | Acceso total al sistema |
| `Admin` | Gestión de usuarios y configuración |
| `Tecnico` | Gestión de equipos y mantenimientos |
| `Usuario` | Consulta y creación de solicitudes |

---

## Estructura del proyecto

```
Nuevo aplicativo/
├── FrontAppHusrt-biomedica-general/   # Aplicación Angular
│   └── src/app/
│       ├── Components/                # Módulos de la app
│       ├── app.routes.ts              # Rutas principales
│       └── auth.guard.ts              # Guard de autenticación
│
└── NodeBackendProyectHusrt-biomedica-general/  # API REST
    ├── src/index.js                   # Punto de entrada
    ├── config/configDb.js             # Conexión a BD (Sequelize)
    ├── models/                        # Modelos de datos
    ├── routes/                        # Rutas de la API
    ├── controllers/                   # Lógica de negocio
    └── .env.example                   # Plantilla de variables de entorno
```

---

## Notas de seguridad

- Nunca subir el archivo `.env` al repositorio (ya está en `.gitignore`)
- Usar contraseñas fuertes y un `JWT_SECRET` generado aleatoriamente en producción
- No usar el usuario `root` de la base de datos en producción; crear un usuario con permisos limitados

---

## Desarrollado para

**Hospital Universitario San Rafael de Tunja**
Área de Ingeniería Biomédica
