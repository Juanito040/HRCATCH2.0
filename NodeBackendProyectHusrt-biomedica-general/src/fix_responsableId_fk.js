const sequelize = require('../config/configDb');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        // Drop old FK that pointed to Responsable table
        try {
            await sequelize.query('ALTER TABLE sistemasinformacion DROP FOREIGN KEY sistemasinformacion_responsableId_fk;');
            console.log('Old FK sistemasinformacion_responsableId_fk dropped.');
        } catch (error) {
            console.log('Drop FK failed (may not exist):', error.message);
        }

        // Add new FK pointing to Usuario table
        try {
            await sequelize.query('ALTER TABLE sistemasinformacion ADD CONSTRAINT sistemasinformacion_responsableId_fk FOREIGN KEY (responsableId) REFERENCES Usuario(id);');
            console.log('New FK responsableId -> Usuario(id) added successfully.');
        } catch (error) {
            console.log('Add FK failed:', error.message);
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
