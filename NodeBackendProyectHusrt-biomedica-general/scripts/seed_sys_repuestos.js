/**
 * Seed script: crea Tipos de Repuesto y Repuestos de prueba en la base de datos.
 * Ejecutar con: node scripts/seed_sys_repuestos.js
 */

require('dotenv').config();
const mariadb = require('mariadb');

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
    console.log('🌱 Iniciando test / poblamiento del Módulo de Repuestos...');

    // 1. Crear Tipos de Repuestos (Catálogos)
    const tipos = [
      { nombre: 'Sensores y Transductores', descripcion: 'Elementos de medición directa al paciente.' },
      { nombre: 'Cables y Latiguillos', descripcion: 'Accesorios de conexión para monitoreo.' },
      { nombre: 'Baterías y Fuentes', descripcion: 'Almacenamiento de poder y adaptadores DC.' },
      { nombre: 'Placas y Circuitos', descripcion: 'Componentes electrónicos internos PBA.' },
      { nombre: 'Neumática y Válvulas', descripcion: 'Componentes para ventiladores y máquinas de anestesia.' },
      { nombre: 'Carcasas y Mecánica', descripcion: 'Chasis, perillas, ruedas y plásticos.' }
    ];

    console.log('\n📦 Creando Tipos de Repuestos...');
    for (const t of tipos) {
      // Evitar duplicados
      const existe = await conn.query('SELECT id_sys_tipo_repuesto FROM SysTipoRepuesto WHERE nombre = ?', [t.nombre]);
      if (existe.length === 0) {
        await conn.query(
          `INSERT INTO SysTipoRepuesto (nombre, descripcion, is_active, createdAt, updatedAt) VALUES (?, ?, true, NOW(), NOW())`,
          [t.nombre, t.descripcion]
        );
        console.log(`  ➕ Añadido: ${t.nombre}`);
      } else {
        console.log(`  ➡️ Omitido (ya existe): ${t.nombre}`);
      }
    }

    // Obtener los IDs de los tipos creados
    const tiposDB = await conn.query('SELECT id_sys_tipo_repuesto, nombre FROM SysTipoRepuesto');
    
    // Función helper para obtener el ID de un tipo por su nombre parcial
    const getTipoId = (nombreParcial) => {
      const tipo = tiposDB.find(t => t.nombre.includes(nombreParcial));
      return tipo ? tipo.id_sys_tipo_repuesto : null;
    };

    if (tiposDB.length === 0) {
      throw new Error('No se encontraron Tipos de Repuestos disponibles en la base de datos.');
    }

    // 2. Crear Repuestos
    const repuestos = [
      {
        nombre: 'Sensor SpO2 Reusable Pediátrico',
        descripcion_tecnica: 'Sensor de oximetría de pulso tipo pinza, longitud 1.5m.',
        numero_parte: 'SPO-PED-001',
        numero_serie: 'N/A',
        id_sys_tipo_repuesto_fk: getTipoId('Sensores'),
        modelo_asociado: 'Monitores Multiparámetros Genéricos',
        proveedor: 'Mindray Medical',
        garantia_inicio: '2025-01-01',
        garantia_fin: '2026-01-01',
        cantidad_stock: 15,
        ubicacion_fisica: 'Almacén Principal - Estante B2',
        estado: 'Nuevo',
        fecha_ingreso: '2025-01-05',
        costo_unitario: 120000.00
      },
      {
        nombre: 'Cable Troncal ECG 3 Derivaciones',
        descripcion_tecnica: 'Cable tipo Snap, protección contra desfibrilación.',
        numero_parte: 'ECG-3L-SNAP',
        numero_serie: 'N/A',
        id_sys_tipo_repuesto_fk: getTipoId('Cables'),
        modelo_asociado: 'Philips IntelliVue MX400',
        proveedor: 'Philips Healthcare',
        garantia_inicio: '2024-06-15',
        garantia_fin: '2025-06-15',
        cantidad_stock: 5,
        ubicacion_fisica: 'Almacén Principal - Estante B3',
        estado: 'Reacondicionado',
        fecha_ingreso: '2024-06-20',
        costo_unitario: 85000.00
      },
      {
        nombre: 'Batería de Iones de Litio 11.1V 4000mAh',
        descripcion_tecnica: 'Batería recargable para monitor de signos vitales portátil.',
        numero_parte: 'LI-111-4000',
        numero_serie: 'BAT-2023-8890',
        id_sys_tipo_repuesto_fk: getTipoId('Baterías'),
        modelo_asociado: 'Edan M3',
        proveedor: 'Biomédica Local S.A.S',
        garantia_inicio: '2025-02-10',
        garantia_fin: '2025-08-10',
        cantidad_stock: 2,
        ubicacion_fisica: 'Cuarto Frío - Baterías',
        estado: 'Nuevo',
        fecha_ingreso: '2025-02-12',
        costo_unitario: 250000.00
      },
      {
        nombre: 'Placa Principal (Mainboard) Desfibrilador',
        descripcion_tecnica: 'Placa de control central con circuito de descarga capacitiva.',
        numero_parte: 'MB-ZOLL-M',
        numero_serie: 'SN-MB-99321',
        id_sys_tipo_repuesto_fk: getTipoId('Placas'),
        modelo_asociado: 'Zoll M Series',
        proveedor: 'Zoll Medical',
        garantia_inicio: '2024-11-01',
        garantia_fin: '2025-11-01',
        cantidad_stock: 1,
        ubicacion_fisica: 'Vitrina de Seguridad',
        estado: 'Nuevo',
        fecha_ingreso: '2024-11-05',
        costo_unitario: 1500000.00
      },
      {
        nombre: 'Sensor de Flujo Neonatal',
        descripcion_tecnica: 'Sensor de hilo caliente desechable/reutilizable.',
        numero_parte: 'FLW-NEO-008',
        numero_serie: 'N/A',
        id_sys_tipo_repuesto_fk: getTipoId('Sensores'),
        modelo_asociado: 'Dräger Babylog VN500',
        proveedor: 'Dräger',
        garantia_inicio: '2025-03-01',
        garantia_fin: '2025-09-01',
        cantidad_stock: 50,
        ubicacion_fisica: 'Almacén UCIN',
        estado: 'Nuevo',
        fecha_ingreso: '2025-03-10',
        costo_unitario: 45000.00
      },
      {
        nombre: 'Rueda Antiestática con Freno',
        descripcion_tecnica: 'Rueda de 4 pulgadas para carro de paro, resistente a estática.',
        numero_parte: 'WHL-AST-4',
        numero_serie: 'N/A',
        id_sys_tipo_repuesto_fk: getTipoId('Carcasas'),
        modelo_asociado: 'Carros Generales',
        proveedor: 'Ferretería Industrial',
        garantia_inicio: null,
        garantia_fin: null,
        cantidad_stock: 12,
        ubicacion_fisica: 'Taller Quirófanos - Cajón 4',
        estado: 'Nuevo',
        fecha_ingreso: '2024-01-10',
        costo_unitario: 35000.00
      }
    ];

    console.log('\n🔧 Creando Repuestos del Sistema...');
    for (const r of repuestos) {
      if (!r.id_sys_tipo_repuesto_fk) {
        console.log(`  ⚠️ Omitiendo repuesto '${r.nombre}': Tipo no encontrado.`);
        continue;
      }

      const existe = await conn.query('SELECT id_sysrepuesto FROM SysRepuesto WHERE nombre = ? AND numero_parte = ?', [r.nombre, r.numero_parte]);
      
      if (existe.length === 0) {
        await conn.query(
          `INSERT INTO SysRepuesto (
            nombre, descripcion_tecnica, numero_parte, numero_serie,
            id_sys_tipo_repuesto_fk, modelo_asociado, proveedor, garantia_inicio,
            garantia_fin, cantidad_stock, ubicacion_fisica, estado,
            fecha_ingreso, costo_unitario, is_active, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
          [
            r.nombre, r.descripcion_tecnica, r.numero_parte, r.numero_serie,
            r.id_sys_tipo_repuesto_fk, r.modelo_asociado, r.proveedor, r.garantia_inicio,
            r.garantia_fin, r.cantidad_stock, r.ubicacion_fisica, r.estado,
            r.fecha_ingreso, r.costo_unitario
          ]
        );
        console.log(`  ➕ Añadido: ${r.nombre}`);
      } else {
        console.log(`  ➡️ Omitido (ya existe): ${r.nombre}`);
      }
    }

    console.log('\n✅ Script completado. Módulo poblando exitosamente.');
  } catch (err) {
    console.error('❌ Error en el script:', err.message);
  } finally {
    conn.end();
    pool.end();
  }
}

seed();
