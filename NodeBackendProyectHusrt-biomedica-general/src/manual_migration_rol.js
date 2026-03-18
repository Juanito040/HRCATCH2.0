const sequelize = require('../config/configDb');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        try {
            await sequelize.query('ALTER TABLE Usuario ADD COLUMN mesaServicioRolId INTEGER NOT NULL DEFAULT 1;');
            console.log('Column mesaServicioRolId added successfully.');
        } catch (error) {
            console.log('Column might already exist or error:', error.message);
        }

        try {
            await sequelize.query('ALTER TABLE Usuario ADD CONSTRAINT Usuario_mesaServicioRolId_fk FOREIGN KEY (mesaServicioRolId) REFERENCES MesaServicioRol(id);');
            console.log('FK added successfully.');
        } catch (error) {
            console.log('FK creation failed:', error.message);
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
