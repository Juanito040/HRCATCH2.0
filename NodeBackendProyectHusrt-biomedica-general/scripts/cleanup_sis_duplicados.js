/**
 * cleanup_sis_duplicados.js
 * Diagnostica y elimina equipos duplicados del módulo Sistemas.
 * Mantiene el registro con ID más bajo por cada placa_inventario.
 * Uso: node scripts/cleanup_sis_duplicados.js
 * Uso (solo diagnóstico, sin borrar): node scripts/cleanup_sis_duplicados.js --dry-run
 */

require('dotenv').config();
const sequelize  = require('../config/configDb');
const { QueryTypes } = require('sequelize');

const DRY_RUN = process.argv.includes('--dry-run');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa.\n');

    // ── 1. Total de equipos actuales ─────────────────────────────────────────
    const [{ total }] = await sequelize.query(
      'SELECT COUNT(*) AS total FROM SysEquipo',
      { type: QueryTypes.SELECT }
    );
    console.log(`📦 Total equipos en BD: ${total}\n`);

    // ── 2. Duplicados por placa_inventario ───────────────────────────────────
    const duplicadosPorPlaca = await sequelize.query(`
      SELECT placa_inventario, COUNT(*) AS cnt, MIN(id_sysequipo) AS id_mantener
      FROM SysEquipo
      WHERE placa_inventario IS NOT NULL AND placa_inventario != ''
      GROUP BY placa_inventario
      HAVING COUNT(*) > 1
    `, { type: QueryTypes.SELECT });

    // ── 3. Equipos sin placa (posibles basura o de prueba) ───────────────────
    const sinPlaca = await sequelize.query(`
      SELECT id_sysequipo, nombre_equipo, createdAt
      FROM SysEquipo
      WHERE placa_inventario IS NULL OR placa_inventario = ''
      ORDER BY id_sysequipo
    `, { type: QueryTypes.SELECT });

    if (duplicadosPorPlaca.length === 0 && sinPlaca.length === 0) {
      console.log('✅ No se encontraron duplicados ni registros sin placa. Todo limpio.\n');
      return;
    }

    // ── Mostrar duplicados ────────────────────────────────────────────────────
    if (duplicadosPorPlaca.length > 0) {
      console.log(`⚠️  Placas duplicadas (${duplicadosPorPlaca.length}):`);
      for (const row of duplicadosPorPlaca) {
        console.log(`   Placa: ${row.placa_inventario}  x${row.cnt}  → se mantiene ID=${row.id_mantener}`);
      }
      console.log('');
    }

    if (sinPlaca.length > 0) {
      console.log(`⚠️  Equipos SIN placa (${sinPlaca.length}):`);
      for (const row of sinPlaca) {
        console.log(`   ID=${row.id_sysequipo}  "${row.nombre_equipo}"  (${row.createdAt})`);
      }
      console.log('');
    }

    if (DRY_RUN) {
      console.log('ℹ️  Modo --dry-run: no se realizaron cambios.');
      console.log('   Ejecuta sin --dry-run para eliminar los duplicados.\n');
      return;
    }

    // ── 4. Eliminar duplicados por placa (conservar el de menor ID) ──────────
    let borradosDupPlaca = 0;
    for (const { placa_inventario, id_mantener } of duplicadosPorPlaca) {
      const [, meta] = await sequelize.query(`
        DELETE FROM SysEquipo
        WHERE placa_inventario = :placa AND id_sysequipo != :id
      `, {
        replacements: { placa: placa_inventario, id: id_mantener },
        type: QueryTypes.DELETE
      });
      borradosDupPlaca += meta;
    }

    // ── 5. Preguntar sobre los sin placa ─────────────────────────────────────
    //    Por seguridad, solo los borramos si el usuario confirma con --delete-sin-placa
    let borradosSinPlaca = 0;
    if (sinPlaca.length > 0 && process.argv.includes('--delete-sin-placa')) {
      const idsSinPlaca = sinPlaca.map(r => r.id_sysequipo);
      await sequelize.query(`
        DELETE FROM SysEquipo WHERE id_sysequipo IN (:ids)
      `, {
        replacements: { ids: idsSinPlaca },
        type: QueryTypes.DELETE
      });
      borradosSinPlaca = sinPlaca.length;
      console.log(`🗑️  Eliminados ${borradosSinPlaca} equipos sin placa.`);
    } else if (sinPlaca.length > 0) {
      console.log(`ℹ️  Los ${sinPlaca.length} equipos sin placa NO se eliminaron.`);
      console.log('   Agrega --delete-sin-placa para eliminarlos también.\n');
    }

    // ── 6. Resultado ─────────────────────────────────────────────────────────
    const [{ totalFinal }] = await sequelize.query(
      'SELECT COUNT(*) AS totalFinal FROM SysEquipo',
      { type: QueryTypes.SELECT }
    );

    console.log(`\n══════════════════════════════════════════`);
    console.log(`🗑️  Duplicados eliminados  : ${borradosDupPlaca}`);
    if (borradosSinPlaca > 0)
      console.log(`🗑️  Sin placa eliminados   : ${borradosSinPlaca}`);
    console.log(`📦 Equipos restantes       : ${totalFinal}`);
    console.log(`══════════════════════════════════════════\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sequelize.close();
  }
}

run();
