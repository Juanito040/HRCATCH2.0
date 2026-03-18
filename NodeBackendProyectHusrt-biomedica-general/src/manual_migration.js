const sequelize = require('../config/configDb');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        // Attempt to add column without FK first
        try {
            await sequelize.query('ALTER TABLE Usuario ADD COLUMN servicioId INTEGER NOT NULL DEFAULT 1;');
            console.log('Column servicioId added successfully.');
        } catch (error) {
            console.log('Column might already exist or error:', error.message);
        }

        // Attempt to add index/FK separately
        try {
            await sequelize.query('ALTER TABLE Usuario ADD CONSTRAINT Usuario_servicioId_fk FOREIGN KEY (servicioId) REFERENCES Servicio(id);');
            console.log('FK added successfully.');
        } catch (error) {
            console.log('FK creation failed (might simply be skipped if keys are full):', error.message);
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
