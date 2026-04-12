/**
 * Seed script: crea un usuario ADMIN y un SUPERUSUARIO en la base de datos.
 * Ejecutar con: node scripts/seed_usuarios.js
 */

require('dotenv').config();
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function seed() {
  const conn = await pool.getConnection();
  try {
    // Leer IDs de referencia
    const roles = await conn.query('SELECT id, nombre FROM Rol');
    console.log('Roles disponibles:', roles.map(r => `${r.id}:${r.nombre}`).join(', '));

    const rolSuperAdmin = roles.find(r => r.nombre.toUpperCase().includes('SUPERADMIN'));
    const rolAdmin = roles.find(r => r.nombre.toUpperCase().includes('ADMIN') && !r.nombre.toUpperCase().includes('SUPERADMIN'));

    if (!rolSuperAdmin) throw new Error('No se encontró rol SUPERADMIN en la base de datos');
    if (!rolAdmin) throw new Error('No se encontró rol ADMIN en la base de datos');

    const [cargo] = await conn.query('SELECT id FROM Cargo LIMIT 1');
    const [servicio] = await conn.query('SELECT id FROM Servicio LIMIT 1');
    const [mesa] = await conn.query('SELECT id FROM MesaServicioRol LIMIT 1');

    const cargoId = cargo.id;
    const servicioId = servicio.id;
    const mesaServicioRolId = mesa.id;

    const usuarios = [
      {
        nombres: 'Super',
        apellidos: 'Usuario',
        nombreUsuario: 'superusuario',
        tipoId: 'CC',
        numeroId: '10000001',
        telefono: '3000000001',
        email: 'superusuario@husrt.local',
        contrasena: 'Admin1234!',
        rolId: rolSuperAdmin.id,
        cargoId,
        servicioId,
        mesaServicioRolId,
      },
      {
        nombres: 'Admin',
        apellidos: 'Sistema',
        nombreUsuario: 'admin',
        tipoId: 'CC',
        numeroId: '10000002',
        telefono: '3000000002',
        email: 'admin@husrt.local',
        contrasena: 'Admin1234!',
        rolId: rolAdmin.id,
        cargoId,
        servicioId,
        mesaServicioRolId,
      },
    ];

    for (const u of usuarios) {
      // Verificar si ya existe
      const existing = await conn.query(
        'SELECT id FROM Usuario WHERE nombreUsuario = ? OR email = ?',
        [u.nombreUsuario, u.email]
      );
      if (existing.length > 0) {
        console.log(`⚠️  Usuario '${u.nombreUsuario}' ya existe, omitiendo.`);
        continue;
      }

      const hashed = await bcrypt.hash(u.contrasena, 10);
      await conn.query(
        `INSERT INTO Usuario (nombres, apellidos, nombreUsuario, tipoId, numeroId, telefono, email, contraseña, estado, rolId, cargoId, servicioId, mesaServicioRolId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?, ?, ?, NOW(), NOW())`,
        [u.nombres, u.apellidos, u.nombreUsuario, u.tipoId, u.numeroId, u.telefono, u.email, hashed, u.rolId, u.cargoId, u.servicioId, u.mesaServicioRolId]
      );
      console.log(`✅ Usuario '${u.nombreUsuario}' creado con rol ID ${u.rolId}`);
    }

    console.log('\n=== CREDENCIALES ===');
    console.log('Superusuario → usuario: superusuario | contraseña: Admin1234!');
    console.log('Admin        → usuario: admin        | contraseña: Admin1234!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    conn.end();
    pool.end();
  }
}

seed();
