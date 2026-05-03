const sequelize = require('../config/configDb');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Conexión exitosa.');

        try {
            await sequelize.query('ALTER TABLE SysHojaVida ADD COLUMN fecha_inicio_soporte DATE NULL;');
            console.log('Columna fecha_inicio_soporte agregada.');
        } catch (error) {
            console.log('fecha_inicio_soporte ya existe o error:', error.message);
        }

        try {
            await sequelize.query('ALTER TABLE SysHojaVida ADD COLUMN anos_soporte_fabricante INT NULL;');
            console.log('Columna anos_soporte_fabricante agregada.');
        } catch (error) {
            console.log('anos_soporte_fabricante ya existe o error:', error.message);
        }

    } catch (error) {
        console.error('Migración fallida:', error);
    } finally {
        await sequelize.close();
        console.log('Migración finalizada.');
    }
}

migrate();
