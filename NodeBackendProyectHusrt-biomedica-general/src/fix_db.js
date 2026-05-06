const sequelize = require('./../config/configDb');

async function fixDb() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        
        await sequelize.query('ALTER TABLE `SysMovimientosStockRepuestos` ADD COLUMN `sysReporteIdFk` INTEGER NULL;');
        console.log('Column added successfully.');
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
fixDb();
