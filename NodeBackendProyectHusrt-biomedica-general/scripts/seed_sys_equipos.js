/**
 * seed_sys_equipos.js
 * A) Actualiza los equipos viejos (sin servicio/tipo) con FK reales.
 * B) Inserta nuevos equipos de red y networking con FK reales.
 * Uso: node scripts/seed_sys_equipos.js
 */

require('dotenv').config();
const sequelize = require('../config/configDb');
const { Op }    = require('sequelize');

const Sede       = require('../models/generales/Sede');
const Servicio   = require('../models/generales/Servicio');
const TipoEquipo = require('../models/generales/TipoEquipo');
const SysEquipo  = require('../models/Sistemas/SysEquipo');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la BD exitosa.\n');

    // ── 1. Leer catálogos reales ─────────────────────────────────────────
    const servicios = await Servicio.findAll({ where: { activo: true } });
    let tiposEquipo = await TipoEquipo.findAll({ where: { activo: true, tipoR: 2 } });
    if (tiposEquipo.length === 0) {
      console.warn('⚠️  No hay TipoEquipo con tipoR=2. Usando todos los tipos activos.');
      tiposEquipo = await TipoEquipo.findAll({ where: { activo: true } });
    }

    if (servicios.length === 0)  { console.error('❌ No hay servicios activos.');      process.exit(1); }
    if (tiposEquipo.length === 0){ console.error('❌ No hay tipos de equipo activos.'); process.exit(1); }

    console.log('📋 Catálogos encontrados:');
    servicios.forEach(s  => console.log(`   Servicio  [${s.id}] ${s.nombres}`));
    tiposEquipo.forEach(t=> console.log(`   TipoEquipo[${t.id}] ${t.nombres} (tipoR=${t.tipoR})`));
    console.log('');

    const pick = (arr, i) => arr[i % arr.length];

    // ── 2. PARTE A: Actualizar equipos viejos sin FK ─────────────────────
    // Los detectamos por placa_inventario con prefijo INV-SYS-
    const viejos = await SysEquipo.findAll({
      where: {
        [Op.and]: [
          { id_servicio_fk:    null },
          { id_tipo_equipo_fk: null },
          { placa_inventario: { [Op.like]: 'INV-SYS-%' } }
        ]
      }
    });

    console.log(`🔄 PARTE A: Actualizando ${viejos.length} equipos viejos (sin servicio/tipo)...\n`);
    let updOk = 0;

    for (let i = 0; i < viejos.length; i++) {
      const eq   = viejos[i];
      const serv = pick(servicios, i);
      const tipo = pick(tiposEquipo, i < 2 ? 0 : 2); // primeros 2 = red, resto = PC

      await SysEquipo.update(
        { id_servicio_fk: serv.id, id_tipo_equipo_fk: tipo.id },
        { where: { id_sysequipo: eq.id_sysequipo } }
      );
      console.log(`   ✏️  [ID=${eq.id_sysequipo}] ${eq.nombre_equipo}`);
      console.log(`        → Servicio: ${serv.nombres} | Tipo: ${tipo.nombres}`);
      updOk++;
    }

    if (viejos.length === 0) {
      console.log('   ℹ️  No se encontraron equipos con placa INV-SYS-* sin FK. Puede que ya estén asignados.\n');
    }

    // ── 3. PARTE B: Insertar nuevos equipos ──────────────────────────────
    const nuevosData = [
      {
        nombre_equipo:        'Switch Cisco Catalyst 2960',
        marca:                'Cisco',
        modelo:               'WS-C2960-24TT-L',
        serie:                'FCZ1947A0HK',
        placa_inventario:     'SIS-SW-001',
        codigo:               'SW-001',
        ubicacion:            'Cuarto de Redes Piso 1',
        ubicacion_especifica: 'Rack Principal',
        activo:               1, estado_baja: 0,
        ano_ingreso:          '2021-06-15',
        periodicidad:         90,
        administrable:        1,
        direccionamiento_Vlan:'192.168.1.1',
        numero_puertos:       24,
        id_servicio_fk:       pick(servicios, 0).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 0).id,
      },
      {
        nombre_equipo:        'Router MikroTik RB3011',
        marca:                'MikroTik',
        modelo:               'RB3011UiAS-RM',
        serie:                'MT211045B',
        placa_inventario:     'SIS-RT-001',
        codigo:               'RT-001',
        ubicacion:            'Cuarto de Redes Piso 2',
        ubicacion_especifica: 'Rack Secundario',
        activo:               1, estado_baja: 0,
        ano_ingreso:          '2022-01-10',
        periodicidad:         180,
        administrable:        1,
        direccionamiento_Vlan:'10.0.0.1',
        numero_puertos:       10,
        id_servicio_fk:       pick(servicios, 1).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 0).id,
      },
      {
        nombre_equipo:        'Servidor Dell PowerEdge R740',
        marca:                'Dell',
        modelo:               'PowerEdge R740',
        serie:                'DL9481K',
        placa_inventario:     'SIS-SRV-001',
        codigo:               'SRV-001',
        ubicacion:            'Data Center',
        ubicacion_especifica: 'Rack A Unidad 3',
        activo:               1, estado_baja: 0,
        ano_ingreso:          '2020-03-20',
        periodicidad:         365,
        administrable:        1,
        direccionamiento_Vlan:'172.16.0.10',
        numero_puertos:       4,
        id_servicio_fk:       pick(servicios, 0).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 1).id,
      },
      {
        nombre_equipo:        'UPS APC Smart-UPS 1500',
        marca:                'APC',
        modelo:               'SMT1500RM2U',
        serie:                'AS1830052394',
        placa_inventario:     'SIS-UPS-001',
        codigo:               'UPS-001',
        ubicacion:            'Cuarto de Redes Piso 1',
        ubicacion_especifica: 'Debajo del Rack Principal',
        activo:               1, estado_baja: 0,
        ano_ingreso:          '2021-08-01',
        periodicidad:         180,
        administrable:        0,
        numero_puertos:       0,
        id_servicio_fk:       pick(servicios, 2).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 0).id,
      },
      {
        nombre_equipo:        'Access Point Ubiquiti UniFi AP-AC-Pro',
        marca:                'Ubiquiti',
        modelo:               'UAP-AC-PRO',
        serie:                'F09FC2A4B011',
        placa_inventario:     'SIS-AP-001',
        codigo:               'AP-001',
        ubicacion:            'Urgencias',
        ubicacion_especifica: 'Techo central sala de espera',
        activo:               1, estado_baja: 0,
        ano_ingreso:          '2022-05-18',
        periodicidad:         180,
        administrable:        1,
        direccionamiento_Vlan:'192.168.10.50',
        numero_puertos:       1,
        id_servicio_fk:       pick(servicios, 1).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 0).id,
      },
      {
        nombre_equipo:        'PC HP EliteDesk 800 G6 - Gerencia',
        marca:                'HP',
        modelo:               'EliteDesk 800 G6',
        serie:                'CZC0347XKL',
        placa_inventario:     'SIS-PC-101',
        codigo:               'PC-GER-001',
        ubicacion:            'Gerencia',
        ubicacion_especifica: 'Oficina Gerente General',
        activo:               1, estado_baja: 0,
        ano_ingreso:          '2023-02-14',
        periodicidad:         365,
        administrable:        0,
        numero_puertos:       0,
        id_servicio_fk:       pick(servicios, 0).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 2).id,
      },
      {
        nombre_equipo:        'PC Lenovo ThinkCentre - Laboratorio Clínico',
        marca:                'Lenovo',
        modelo:               'ThinkCentre M70q',
        serie:                'SN-LN-LAB-2023',
        placa_inventario:     'SIS-PC-102',
        codigo:               'PC-LAB-101',
        ubicacion:            'Laboratorio Clínico',
        ubicacion_especifica: 'Mesa Principal',
        activo:               1, estado_baja: 0,
        ano_ingreso:          '2023-01-10',
        periodicidad:         365,
        administrable:        0,
        numero_puertos:       0,
        id_servicio_fk:       pick(servicios, 3).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 2).id,
      },
      // ── Dados de baja ──
      {
        nombre_equipo:        'Switch 3Com OfficeConnect 16 (BAJA)',
        marca:                '3Com',
        modelo:               '3CBLSG16',
        serie:                '3C9K1234AB',
        placa_inventario:     'SIS-OLD-001',
        codigo:               'SW-OLD-001',
        ubicacion:            'Depósito',
        ubicacion_especifica: 'Estante 2',
        activo:               0, estado_baja: 1,
        administrable:        0,
        numero_puertos:       16,
        id_servicio_fk:       pick(servicios, 0).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 0).id,
      },
      {
        nombre_equipo:        'Monitor Samsung SyncMaster 943N (BAJA)',
        marca:                'Samsung',
        modelo:               '943N',
        serie:                'H3VN700126',
        placa_inventario:     'SIS-OLD-002',
        codigo:               'MON-OLD-001',
        activo:               0, estado_baja: 1,
        administrable:        0,
        numero_puertos:       0,
        id_servicio_fk:       pick(servicios, 1).id,
        id_tipo_equipo_fk:    pick(tiposEquipo, 2).id,
      },
    ];

    console.log(`\n➕ PARTE B: Insertando ${nuevosData.length} equipos nuevos...\n`);
    let insOk = 0, insFail = 0;

    for (const data of nuevosData) {
      try {
        const equipo = await SysEquipo.create(data);
        const tipo   = tiposEquipo.find(t => t.id === data.id_tipo_equipo_fk)?.nombres || '?';
        const serv   = servicios.find(s   => s.id === data.id_servicio_fk)?.nombres    || '?';
        const icono  = data.estado_baja ? '🔴' : '🟢';
        console.log(`   ${icono} [ID=${equipo.id_sysequipo}] ${equipo.nombre_equipo}`);
        console.log(`        Tipo: ${tipo} | Servicio: ${serv}`);
        insOk++;
      } catch (e) {
        console.error(`   ❌ Error "${data.nombre_equipo}": ${e.message}`);
        insFail++;
      }
    }

    console.log(`\n══════════════════════════════════════════`);
    console.log(`✅ Actualizados : ${updOk}  equipos viejos`);
    console.log(`✅ Insertados   : ${insOk}  equipos nuevos`);
    if (insFail > 0) console.log(`❌ Fallidos     : ${insFail}`);
    console.log(`══════════════════════════════════════════\n`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
    if (error.parent) console.error('   BD:', error.parent.message);
  } finally {
    await sequelize.close();
  }
}

seed();
