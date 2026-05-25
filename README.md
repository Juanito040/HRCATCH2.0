# HRCATCH 2.0 — Sistema de Gestión Integral HUSRT

Sistema web full-stack desarrollado para el **Hospital Universitario San Rafael de Tunja (HUSRT)**, orientado a la gestión integral de equipos biomédicos y de sistemas, mantenimiento preventivo y correctivo, metrología, backups y soporte técnico interno.

---

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Biomédica** | Inventario de equipos, hoja de vida, mantenimiento preventivo y correctivo, metrología, protocolos, trazabilidad, indicadores y reportes |
| **Sistemas** | Gestión de equipos de TI, mantenimiento, repuestos, trazabilidad, indicadores y traslados |
| **Backups** | Registro de sistemas de información, calendario de backups y alertas de vencimiento |
| **Mesa de Servicios** | Gestión de tickets y casos de soporte interno por categoría y rol |
| **Administración** | Usuarios, roles, fabricantes, proveedores, responsables, sedes, servicios y clasificaciones |

---

## Stack tecnológico

### Frontend — Angular 19
- Angular 19.2, Angular Material, PrimeNG 19, Bootstrap 5
- Chart.js para dashboards; jsPDF + jsPDF-AutoTable para reportes PDF; ExcelJS + XLSX para exportación a Excel
- @zxing/ngx-scanner para lectura de QR y código de barras; signature_pad para firmas digitales
- Autenticación JWT con route guards y control de acceso basado en roles (RBAC)

### Backend — Node.js + Express
- Express 4, Sequelize 6 (ORM), MariaDB / MySQL 8+
- JWT + bcryptjs para autenticación y hash de contraseñas
- Multer para carga de archivos, Nodemailer para notificaciones por correo, PDFKit para generación de documentos PDF
- Axios para integraciones HTTP, ExcelJS para exportación de datos

---

## Requisitos previos

- Node.js >= 18.x
- Angular CLI >= 19.x (`npm install -g @angular/cli`)
- MariaDB >= 10.x o MySQL >= 8.x
- Git

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd HRCATCH2.0
```

### 2. Backend

```bash
cd NodeBackendProyectHusrt-biomedica-general
npm install
cp .env.example .env
```

Editar `.env` con los valores del entorno:

```env
DB_NAME=nombre_base_de_datos
DB_USER=usuario_db
DB_PASSWORD=contraseña_segura
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=cadena_aleatoria_larga_y_segura
PORT=3005
MAIL_USER=correo@dominio.gov.co
MAIL_PASS=app_password_del_correo
CLIENT_URL=http://localhost:4200
```

Para generar un `JWT_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Iniciar el servidor:

```bash
npm run dev      # desarrollo con hot-reload (nodemon)
npm start        # producción
```

Disponible en `http://localhost:3005`.

> Al iniciar, el servidor ejecuta automáticamente las migraciones `ADD COLUMN IF NOT EXISTS` necesarias. No se requieren scripts de migración manuales.

### 3. Frontend

```bash
cd FrontAppHusrt-biomedica-general
npm install
ng serve
```

Disponible en `http://localhost:4200`.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_NAME` | Nombre de la base de datos | `husrt_biomedica` |
| `DB_USER` | Usuario de MariaDB/MySQL | `app_user` |
| `DB_PASSWORD` | Contraseña del usuario | — |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `3306` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | — |
| `PORT` | Puerto del servidor Express | `3005` |
| `MAIL_USER` | Correo para envío de notificaciones | `correo@dominio.gov.co` |
| `MAIL_PASS` | App Password del correo (no la contraseña de la cuenta) | — |
| `CLIENT_URL` | URL del frontend | `http://localhost:4200` |

---

## Roles del sistema

### Globales
| Rol | Acceso |
|-----|--------|
| `SUPERADMIN` | Acceso total a todos los módulos |
| `ADMINISTRADOR` / `ADM` | Administración general y mesa de servicios |

### Módulo Biomédica
| Rol | Acceso |
|-----|--------|
| `BIOMEDICAADMIN` | Gestión completa |
| `BIOMEDICAUSER` | Consulta y registro |
| `BIOMEDICATECNICO` | Equipos, mantenimientos y actividades técnicas |
| `INVITADO` | Solo lectura |

### Módulo Sistemas
| Rol | Acceso |
|-----|--------|
| `SYSTEMADMIN` | Gestión completa |
| `SYSTEMUSER` | Consulta y registro |
| `SISTEMASTECNICO` | Equipos, mantenimientos y repuestos |

### Mesa de Servicios
| Rol | Acceso |
|-----|--------|
| `MESAADMIN` | Administración y configuración |
| `MESAUSER` / `SOL` | Creación y seguimiento de casos |
| `OBS` | Solo lectura |

---

## Estructura del proyecto

```
HRCATCH2.0/
├── FrontAppHusrt-biomedica-general/
│   └── src/app/
│       ├── Components/
│       │   ├── Sistemas/          # Equipos, backups, repuestos, mantenimiento
│       │   ├── MesaServicios/     # Tickets y casos de soporte
│       │   ├── administracion/    # Usuarios y parametrización
│       │   ├── navbars/           # Barras de navegación por rol
│       │   └── userBiomedica/     # Inventario y gestión biomédica
│       ├── Services/              # Servicios HTTP, autenticación, notificaciones
│       ├── guards/                # Guards de autenticación y roles
│       └── app.routes.ts          # Definición de rutas
│
└── NodeBackendProyectHusrt-biomedica-general/
    ├── src/index.js               # Punto de entrada, migraciones automáticas y arranque
    ├── config/configDb.js         # Conexión Sequelize
    ├── models/
    │   ├── Biomedica/             # Modelos del módulo biomédica
    │   ├── Sistemas/              # Modelos del módulo sistemas
    │   ├── MesaServicios/         # Modelos de mesa de servicios
    │   └── generales/             # Modelos compartidos (usuario, rol, sede)
    ├── routes/
    │   ├── biomedica/             # Endpoints biomédica y backups
    │   ├── sistemas/              # Endpoints módulo sistemas
    │   ├── general/               # Endpoints generales
    │   └── mesaservicios/         # Endpoints mesa de servicios
    ├── utilities/middleware.js    # Middleware de validación JWT
    └── .env.example               # Plantilla de variables de entorno
```

---

## Notas de seguridad

- No subir el archivo `.env` al repositorio (incluido en `.gitignore`).
- Usar un `JWT_SECRET` generado aleatoriamente; nunca usar valores predecibles en producción.
- Crear un usuario de base de datos con permisos mínimos; no usar `root` en producción.
- El `MAIL_PASS` debe ser un App Password generado desde la configuración de seguridad del correo, no la contraseña de la cuenta.
