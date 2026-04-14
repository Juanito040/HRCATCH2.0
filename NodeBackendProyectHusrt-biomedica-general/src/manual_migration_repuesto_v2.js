/**
 * Script de migración: Módulo Repuestos v2
 * Agrega campos a SysTipoRepuesto y crea la tabla SysAuditoriaRepuesto.
 * Ejecutar con:  node src/manual_migration_repuesto_v2.js
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mariadb',
    logging: console.log
  }
);

async function migrate() {
  const qi = sequelize.getQueryInterface();

  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos.');

    // ── 1. Agregar columnas a SysTipoRepuesto ──────────────────────────────
    const tipoRepuetoCols = await qi.describeTable('SysTipoRepuesto');

    if (!tipoRepuetoCols.fecha_ingreso) {
      await qi.addColumn('SysTipoRepuesto', 'fecha_ingreso', {
        type: DataTypes.DATEONLY,
        allowNull: true
      });
      console.log('✅ Columna fecha_ingreso agregada a SysTipoRepuesto.');
    } else {
      console.log('ℹ️  fecha_ingreso ya existe en SysTipoRepuesto.');
    }

    if (!tipoRepuetoCols.fecha_garantia) {
      await qi.addColumn('SysTipoRepuesto', 'fecha_garantia', {
        type: DataTypes.DATEONLY,
        allowNull: true
      });
      console.log('✅ Columna fecha_garantia agregada a SysTipoRepuesto.');
    } else {
      console.log('ℹ️  fecha_garantia ya existe en SysTipoRepuesto.');
    }

    // ── 2. Crear tabla SysAuditoriaRepuesto ───────────────────────────────
    const tableList = await qi.showAllTables();

    if (!tableList.includes('SysAuditoriaRepuesto')) {
      await qi.createTable('SysAuditoriaRepuesto', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        tabla_origen: {
          type: DataTypes.ENUM('SysRepuesto', 'SysTipoRepuesto'),
          allowNull: false
        },
        id_registro: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        usuario: {
          type: DataTypes.STRING(150),
          allowNull: false
        },
        rol: {
          type: DataTypes.STRING(80),
          allowNull: true
        },
        accion: {
          type: DataTypes.ENUM('creacion', 'edicion', 'activacion', 'inactivacion'),
          allowNull: false
        },
        observacion: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        fecha_hora: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW
        }
      });
      console.log('✅ Tabla SysAuditoriaRepuesto creada.');
    } else {
      console.log('ℹ️  La tabla SysAuditoriaRepuesto ya existe.');
    }

    console.log('\n🎉 Migración completada exitosamente.');
  } catch (err) {
    console.error('❌ Error en la migración:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

migrate();
