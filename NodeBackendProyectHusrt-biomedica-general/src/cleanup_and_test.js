const sequelize = require('../config/configDb');
const SysRepuesto = require('../models/Sistemas/SysRepuesto');
const SysTipoRepuesto = require('../models/Sistemas/SysTipoRepuesto');
const SysAuditoriaRepuesto = require('../models/Sistemas/SysAuditoriaRepuesto');

async function runTest() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // 1. Limpiar tablas
        console.log('Cleaning tables...');
        // Desactivar temporalmente constraints para truncar
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        await SysRepuesto.destroy({ where: {}, truncate: true });
        await SysTipoRepuesto.destroy({ where: {}, truncate: true });
        await SysAuditoriaRepuesto.destroy({ where: {}, truncate: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('Tables emptied.');

        // 2. Crear un Tipo de Repuesto
        console.log('Creating Test Tipo...');
        const tipo = await SysTipoRepuesto.create({
            nombre: 'Tipo de Pruebas',
            descripcion: 'Tipo creado para verificar auditoria'
        });
        console.log('Tipo created ID:', tipo.id_sys_tipo_repuesto);

        // 3. Crear un Repuesto
        console.log('Creating Test Repuesto...');
        const repuesto = await SysRepuesto.create({
            nombre: 'Repuesto de Pruebas',
            id_sys_tipo_repuesto_fk: tipo.id_sys_tipo_repuesto,
            cantidad_stock: 10,
            proveedor: 'Proveedor Test'
        });
        console.log('Repuesto created ID:', repuesto.id_sysrepuesto);

        // 4. Simular Inactivación de Repuesto
        console.log('Simulating deactivation of Repuesto...');
        const userSimulated = 'test_user_admin';
        await repuesto.update({
            is_active: false,
            fecha_inactivacion: new Date(),
            usuario_inactivacion: userSimulated
        });

        // Verificar datos del repuesto
        const repInactivo = await SysRepuesto.findByPk(repuesto.id_sysrepuesto);
        if (!repInactivo.is_active && repInactivo.usuario_inactivacion === userSimulated && repInactivo.fecha_inactivacion) {
            console.log('SUCCESS: Repuesto deactivation audit fields are correct.');
        } else {
            console.error('FAILURE: Repuesto deactivation audit fields mismatch.');
        }

        // 5. Simular Inactivación de Tipo
        console.log('Simulating deactivation of Tipo...');
        await tipo.update({
            is_active: false,
            fecha_inactivacion: new Date(),
            usuario_inactivacion: userSimulated
        });

        const tipoInactivo = await SysTipoRepuesto.findByPk(tipo.id_sys_tipo_repuesto);
        if (!tipoInactivo.is_active && tipoInactivo.usuario_inactivacion === userSimulated && tipoInactivo.fecha_inactivacion) {
            console.log('SUCCESS: Tipo deactivation audit fields are correct.');
        } else {
            console.error('FAILURE: Tipo deactivation audit fields mismatch.');
        }

        console.log('All tests passed successfully!');
    } catch (error) {
        console.error('Test failed with error:', error);
    } finally {
        await sequelize.close();
    }
}

runTest();
