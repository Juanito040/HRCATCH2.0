/**
 * Script para crear 3 usuarios de prueba del módulo Sistemas.
 * Ejecutar desde la raíz del backend:
 *   node scripts/crearUsuariosPrueba.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../config/configDb');
const Usuario = require('../models/generales/Usuario');
const Rol     = require('../models/generales/Rol');

const USUARIOS = [
  {
    nombres:       'Super',
    apellidos:     'Admin Sistemas',
    nombreUsuario: 'superadmin.sis',
    tipoId:        'CC',
    numeroId:      '100000001',
    telefono:      '3000000001',
    email:         'superadmin.sis@husrt.test',
    contrasena:    'SuperAdmin123*',
    rolNombre:     'SUPERADMIN',
  },
  {
    nombres:       'Admin',
    apellidos:     'Sistemas',
    nombreUsuario: 'admin.sistemas',
    tipoId:        'CC',
    numeroId:      '100000002',
    telefono:      '3000000002',
    email:         'admin.sistemas@husrt.test',
    contrasena:    'AdminSis123*',
    rolNombre:     'SYSTEMADMIN',
  },
  {
    nombres:       'Tecnico',
    apellidos:     'Sistemas',
    nombreUsuario: 'tecnico.sistemas',
    tipoId:        'CC',
    numeroId:      '100000003',
    telefono:      '3000000003',
    email:         'tecnico.sistemas@husrt.test',
    contrasena:    'TecnicoSis123*',
    rolNombre:     'SYSTEMUSER',
  }
];

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✔ Conexión a la base de datos establecida.\n');

    for (const u of USUARIOS) {
      // Buscar el rol por nombre
      const rol = await Rol.findOne({ where: { nombre: u.rolNombre } });
      if (!rol) {
        console.error(`✘ Rol "${u.rolNombre}" no encontrado en la BD. Créalo primero.`);
        continue;
      }

      // Verificar si el usuario ya existe
      const existe = await Usuario.findOne({ where: { nombreUsuario: u.nombreUsuario } });
      if (existe) {
        console.log(`⚠ Usuario "${u.nombreUsuario}" ya existe, omitiendo.`);
        continue;
      }

      const contraseña = await bcrypt.hash(u.contrasena, 10);
      await Usuario.create({
        nombres:           u.nombres,
        apellidos:         u.apellidos,
        nombreUsuario:     u.nombreUsuario,
        tipoId:            u.tipoId,
        numeroId:          u.numeroId,
        telefono:          u.telefono,
        email:             u.email,
        contraseña,
        estado:            true,
        rolId:             rol.id,
        cargoId:           1,
        servicioId:        1,
        mesaServicioRolId: 1
      });

      console.log(`✔ Usuario creado: ${u.nombreUsuario} | Rol: ${u.rolNombre} | Contraseña: ${u.contrasena}`);
    }

    console.log('\n--- Resumen de credenciales ---');
    USUARIOS.forEach(u => {
      console.log(`  ${u.rolNombre.padEnd(15)} → usuario: ${u.nombreUsuario.padEnd(20)} contraseña: ${u.contrasena}`);
    });

    await sequelize.close();
    console.log('\n✔ Listo.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
