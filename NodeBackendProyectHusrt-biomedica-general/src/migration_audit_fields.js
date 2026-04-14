const sequelize = require('../config/configDb');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        // Add columns to SysRepuesto
        try {
            await sequelize.query('ALTER TABLE SysRepuesto ADD COLUMN fecha_inactivacion DATETIME NULL;');
            console.log('Column fecha_inactivacion added to SysRepuesto.');
        } catch (error) {
            console.log('SysRepuesto: fecha_inactivacion might already exist or error:', error.message);
        }

        try {
            await sequelize.query('ALTER TABLE SysRepuesto ADD COLUMN usuario_inactivacion VARCHAR(150) NULL;');
            console.log('Column usuario_inactivacion added to SysRepuesto.');
        } catch (error) {
            console.log('SysRepuesto: usuario_inactivacion might already exist or error:', error.message);
        }

        // Add columns to SysTipoRepuesto
        try {
            await sequelize.query('ALTER TABLE SysTipoRepuesto ADD COLUMN fecha_inactivacion DATETIME NULL;');
            console.log('Column fecha_inactivacion added to SysTipoRepuesto.');
        } catch (error) {
            console.log('SysTipoRepuesto: fecha_inactivacion might already exist or error:', error.message);
        }

        try {
            await sequelize.query('ALTER TABLE SysTipoRepuesto ADD COLUMN usuario_inactivacion VARCHAR(150) NULL;');
            console.log('Column usuario_inactivacion added to SysTipoRepuesto.');
        } catch (error) {
            console.log('SysTipoRepuesto: usuario_inactivacion might already exist or error:', error.message);
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
