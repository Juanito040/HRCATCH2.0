const sequelize = require('./../config/configDb');
const SysRepuesto = require('./../models/Sistemas/SysRepuesto');
const SysTipoRepuesto = require('./../models/Sistemas/SysTipoRepuesto');
const SysMovimientosStockRepuestos = require('./../models/Sistemas/SysMovimientosStockRepuestos');

const INCLUDES_REPUESTO = [
  {
    model: SysRepuesto,
    as: 'repuesto',
    attributes: ['id_sysrepuesto', 'nombre', 'numero_parte', 'cantidad_stock', 'stock_minimo'],
    include: [{ model: SysTipoRepuesto, as: 'tipoRepuesto', attributes: ['nombre'] }]
  }
];

async function run() {
    try {
        await sequelize.authenticate();
        
        let repuesto = await SysRepuesto.findOne();
        
        const movimiento = await SysMovimientosStockRepuestos.create({
            id_repuesto_fk: repuesto.id_sysrepuesto,
            tipo: 'ingreso',
            cantidad: 1,
            stock_antes: repuesto.cantidad_stock || 0,
            stock_despues: (repuesto.cantidad_stock || 0) + 1,
            motivo: 'Test',
            usuario: 'test',
            fecha_movimiento: new Date()
        });

        const movimientoCompleto = await SysMovimientosStockRepuestos.findByPk(movimiento.id, {
            include: INCLUDES_REPUESTO
        });

        console.log('Fetch success:', !!movimientoCompleto);
        
        await movimiento.destroy();
    } catch (e) {
        console.error('Error fetching movimiento:', e);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}
run();
