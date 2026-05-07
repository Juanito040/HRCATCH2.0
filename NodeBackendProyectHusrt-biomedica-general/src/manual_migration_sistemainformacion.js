const sequelize = require('../config/configDb');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        // Add responsableId column
        try {
            await sequelize.query('ALTER TABLE sistemasinformacion ADD COLUMN responsableId INTEGER NULL;');
            console.log('Column responsableId added successfully.');
        } catch (error) {
            console.log('Column responsableId might already exist or error:', error.message);
        }

        // Add FK constraint for responsableId
        try {
            await sequelize.query('ALTER TABLE sistemasinformacion ADD CONSTRAINT sistemasinformacion_responsableId_fk FOREIGN KEY (responsableId) REFERENCES Responsable(id);');
            console.log('FK responsableId added successfully.');
        } catch (error) {
            console.log('FK responsableId creation failed:', error.message);
        }

        // Add proveedorId column
        try {
            await sequelize.query('ALTER TABLE sistemasinformacion ADD COLUMN proveedorId INTEGER NULL;');
            console.log('Column proveedorId added successfully.');
        } catch (error) {
            console.log('Column proveedorId might already exist or error:', error.message);
        }

        // Add FK constraint for proveedorId
        try {
            await sequelize.query('ALTER TABLE sistemasinformacion ADD CONSTRAINT sistemasinformacion_proveedorId_fk FOREIGN KEY (proveedorId) REFERENCES Responsable(id);');
            console.log('FK proveedorId added successfully.');
        } catch (error) {
            console.log('FK proveedorId creation failed:', error.message);
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
