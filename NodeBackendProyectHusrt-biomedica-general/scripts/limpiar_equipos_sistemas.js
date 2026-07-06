/**
 * limpiar_equipos_sistemas.js
 * Elimina todos los datos del inventario de Sistemas (equipos y registros relacionados).
 * No borra catálogos (tipos de equipo, sedes, servicios, repuestos, protocolos).
 *
 * Uso: node scripts/limpiar_equipos_sistemas.js
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const sequelize = require('../config/configDb');

// Tablas dependientes (deben borrarse antes que SysEquipo por FKs)
const SysAuditoriaRepuesto          = require('../models/Sistemas/SysAuditoriaRepuesto');
const SysMovimientosStockRepuestos  = require('../models/Sistemas/SysMovimientosStockRepuestos');
const SysCumplimientoProtocoloPreventivo = require('../models/Sistemas/SysCumplimientoProtocoloPreventivo');
const SysProgramacionPreventivoMes  = require('../models/Sistemas/SysProgramacionPreventivoMes');
const SysPlanMantenimiento          = require('../models/Sistemas/SysPlanMantenimiento');
const SysReporteMantenimiento       = require('../models/Sistemas/SysReporteMantenimiento');
const SysReporteEntrega             = require('../models/Sistemas/SysReporteEntrega');
const SysReporte                    = require('../models/Sistemas/SysReporte');
const SysMantenimiento              = require('../models/Sistemas/SysMantenimiento');
const SysTrazabilidad               = require('../models/Sistemas/SysTrazabilidad');
const SysTraslado                   = require('../models/Sistemas/SysTraslado');
const SysBaja                       = require('../models/Sistemas/SysBaja');
const SysBodega                     = require('../models/Sistemas/SysBodega');
const SysHojaVida                   = require('../models/Sistemas/SysHojaVida');
const SysEquipo                     = require('../models/Sistemas/SysEquipo');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida.\n');

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    const tablas = [
      { model: SysAuditoriaRepuesto,         nombre: 'SysAuditoriaRepuesto' },
      { model: SysMovimientosStockRepuestos,  nombre: 'SysMovimientosStockRepuestos' },
      { model: SysCumplimientoProtocoloPreventivo, nombre: 'SysCumplimientoProtocoloPreventivo' },
      { model: SysProgramacionPreventivoMes, nombre: 'SysProgramacionPreventivoMes' },
      { model: SysPlanMantenimiento,         nombre: 'SysPlanMantenimiento' },
      { model: SysReporteMantenimiento,      nombre: 'SysReporteMantenimiento' },
      { model: SysReporteEntrega,            nombre: 'SysReporteEntrega' },
      { model: SysReporte,                   nombre: 'SysReporte' },
      { model: SysMantenimiento,             nombre: 'SysMantenimiento' },
      { model: SysTrazabilidad,              nombre: 'SysTrazabilidad' },
      { model: SysTraslado,                  nombre: 'SysTraslado' },
      { model: SysBaja,                      nombre: 'SysBaja' },
      { model: SysBodega,                    nombre: 'SysBodega' },
      { model: SysHojaVida,                  nombre: 'SysHojaVida' },
      { model: SysEquipo,                    nombre: 'SysEquipo' },
    ];

    for (const { model, nombre } of tablas) {
      const eliminados = await model.destroy({ where: {}, truncate: false });
      console.log(`  ${nombre}: ${eliminados} registro(s) eliminado(s)`);
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ Inventario de Sistemas limpiado correctamente.');
    console.log('   Los catálogos (tipos de equipo, sedes, servicios, repuestos, protocolos) NO fueron modificados.');
  } catch (error) {
    console.error('❌ Error al limpiar el inventario:', error.message);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    process.exit(1);
  } finally {
    await sequelize.close();
  }
})();
