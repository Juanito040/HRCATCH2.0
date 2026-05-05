const sequelize = require('../../config/configDb');

async function fixColumns() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Add periodicidadC
        try {
            await sequelize.query('ALTER TABLE `Equipo` ADD COLUMN `periodicidadC` INTEGER NOT NULL DEFAULT 0;');
            console.log('Added periodicidadC');
        } catch (e) {
            if (e.original && e.original.code === 'ER_DUP_FIELDNAME') {
                console.log('periodicidadC already exists');
            } else {
                console.error('Error adding periodicidadC:', e);
            }
        }

        // Drop actividadMetrologica
        try {
            await sequelize.query('ALTER TABLE `Equipo` DROP COLUMN `actividadMetrologica`;');
            console.log('Dropped actividadMetrologica');
        } catch (e) {
            // ER_CANT_DROP_FIELD_OR_KEY: 1091 - Can't DROP '...'; check that column/key exists
            if (e.original && e.original.errno === 1091) {
                console.log('actividadMetrologica does not exist');
            } else {
                console.error('Error dropping actividadMetrologica:', e);
            }
        }

        process.exit();

    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

fixColumns();
