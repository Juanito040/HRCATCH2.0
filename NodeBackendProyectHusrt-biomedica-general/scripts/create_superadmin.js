require('dotenv').config({ path: __dirname + '/../.env' });
const bcrypt = require('bcryptjs');
const sequelize = require('../config/configDb');

const Rol = require('../models/generales/Rol');
const Cargo = require('../models/generales/Cargo');
const Sede = require('../models/generales/Sede');
const Servicio = require('../models/generales/Servicio');
const MesaServicioRol = require('../models/MesaServicios/MesaServicioRol');
const Usuario = require('../models/generales/Usuario');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.');

    const [rol] = await Rol.findOrCreate({ where: { nombre: 'SUPERADMIN' } });

    const [cargo] = await Cargo.findOrCreate({ where: { nombre: 'Administrador' } });

    const [sede] = await Sede.findOrCreate({
      where: { nombres: 'Sede Principal HUSRT' },
      defaults: { direccion: 'Carrera 11 # 69-80', nit: '891800394-4', ciudad: 'Tunja', departamento: 'Boyacá', estado: true, nivel: 3 },
    });

    const [servicio] = await Servicio.findOrCreate({
      where: { nombres: 'General' },
      defaults: { ubicacion: 'Principal', sedeIdFk: sede.id, requiereMesaServicios: false },
    });

    const [mesaRol] = await MesaServicioRol.findOrCreate({
      where: { codigo: 'NONE' },
      defaults: { nombre: 'Sin rol' },
    });

    const nombreUsuario = 'SUPERADMIN';
    const existing = await Usuario.findOne({ where: { nombreUsuario } });

    if (existing) {
      const hashed = await bcrypt.hash('Super123', 10);
      await existing.update({ contraseña: hashed });
      console.log(`Usuario "${nombreUsuario}" ya existía — contraseña actualizada.`);
    } else {
      const hashed = await bcrypt.hash('Super123', 10);
      await Usuario.create({
        nombres: 'Super',
        apellidos: 'Admin',
        nombreUsuario,
        tipoId: 'CC',
        numeroId: '0000000000',
        telefono: '3000000000',
        email: 'superadmin_root@husrt.local',
        contraseña: hashed,
        estado: true,
        rolId: rol.id,
        cargoId: cargo.id,
        servicioId: servicio.id,
        mesaServicioRolId: mesaRol.id,
      });
      console.log(`Usuario "${nombreUsuario}" creado con rol SUPERADMIN.`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
