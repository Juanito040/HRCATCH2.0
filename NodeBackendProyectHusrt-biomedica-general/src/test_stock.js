const sequelize = require('./../config/configDb');
const SysRepuesto = require('./../models/Sistemas/SysRepuesto');
const SysMovimientosStockRepuestos = require('./../models/Sistemas/SysMovimientosStockRepuestos');

async function run() {
    try {
        await sequelize.authenticate();
        
        // Ensure a repuesto exists
        let repuesto = await SysRepuesto.findOne();
        if (!repuesto) {
            console.log('No repuestos found, cannot test.');
            process.exit(1);
        }

        console.log('Testing with repuesto ID:', repuesto.id_sysrepuesto);

        const movimiento = await SysMovimientosStockRepuestos.create({
            id_repuesto_fk: repuesto.id_sysrepuesto,
            tipo: 'ingreso',
            cantidad: 1,
            stock_antes: repuesto.cantidad_stock || 0,
            stock_despues: (repuesto.cantidad_stock || 0) + 1,
            motivo: 'Test',
            referencia: 'Ref123',
            usuario: 'test_user',
            fecha_movimiento: new Date()
        });

        console.log('Movimiento created:', movimiento.toJSON());
        
        // Cleanup
        await movimiento.destroy();
    } catch (e) {
        console.error('Error creating movimiento:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
run();
