const sequelize = require('./../config/configDb');
const SysRepuesto = require('./../models/Sistemas/SysRepuesto');

async function run() {
    try {
        await sequelize.authenticate();
        
        let repuesto = await SysRepuesto.findOne();
        if (!repuesto) {
            console.log('No repuestos found.');
            process.exit(1);
        }

        console.log('Updating repuesto ID:', repuesto.id_sysrepuesto);
        
        await repuesto.update({ cantidad_stock: (repuesto.cantidad_stock || 0) + 1 });
        
        console.log('Update success');
    } catch (e) {
        console.error('Error updating repuesto:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
run();
