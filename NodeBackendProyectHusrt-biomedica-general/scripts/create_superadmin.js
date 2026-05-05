require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const sequelize = require('../config/configDb');
const Usuario = require('../models/generales/Usuario');
const Rol = require('../models/generales/Rol');
const Cargo = require('../models/generales/Cargo');
const Servicio = require('../models/generales/Servicio');
const MesaServicioRol = require('../models/MesaServicios/MesaServicioRol');

const USERNAME = 'superadmin';
const PASSWORD = 'Super123*';
const EMAIL = 'superadmin@husrt.local';

(async () => {
  try {
    await sequelize.authenticate();

    let rol = await Rol.findOne({ where: { nombre: 'SUPERADMIN' } });
    if (!rol) {
      rol = await Rol.create({ nombre: 'SUPERADMIN' });
      console.log(`Rol SUPERADMIN creado (id=${rol.id})`);
    } else {
      console.log(`Rol SUPERADMIN encontrado (id=${rol.id})`);
    }

    let cargo = await Cargo.findByPk(1);
    if (!cargo) {
      cargo = await Cargo.create({ nombre: 'Administrador' });
      console.log(`Cargo creado (id=${cargo.id})`);
    }

    let servicio = await Servicio.findByPk(1);
    if (!servicio) {
      servicio = await Servicio.create({ nombres: 'General' });
      console.log(`Servicio creado (id=${servicio.id})`);
    }

    let mesaRol = await MesaServicioRol.findByPk(1);
    if (!mesaRol) {
      mesaRol = await MesaServicioRol.create({ codigo: 'NONE', nombre: 'Sin rol' });
      console.log(`MesaServicioRol creado (id=${mesaRol.id})`);
    }

    const existing = await Usuario.findOne({ where: { nombreUsuario: USERNAME } });
    const hashed = await bcrypt.hash(PASSWORD, 10);

    if (existing) {
      await existing.update({
        contraseña: hashed,
        rolId: rol.id,
        estado: true
      });
      console.log(`\nUsuario "${USERNAME}" actualizado (contraseña reseteada).`);
    } else {
      await Usuario.create({
        nombres: 'Super',
        apellidos: 'Admin',
        nombreUsuario: USERNAME,
        tipoId: 'CC',
        numeroId: '0000000001',
        telefono: '0000000000',
        email: EMAIL,
        contraseña: hashed,
        estado: true,
        rolId: rol.id,
        cargoId: cargo.id,
        servicioId: servicio.id,
        mesaServicioRolId: mesaRol.id
      });
      console.log(`\nUsuario "${USERNAME}" creado.`);
    }

    console.log('\n========== CREDENCIALES ==========');
    console.log(`  Usuario:   ${USERNAME}`);
    console.log(`  Password:  ${PASSWORD}`);
    console.log(`  Rol:       SUPERADMIN`);
    console.log('==================================\n');

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
})();
