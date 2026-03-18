const sequelize = require('../config/configDb');

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        const query = `
      ALTER TABLE actividadMetrologica
      ADD COLUMN confirmacionMetrologica VARCHAR(255) DEFAULT '';
    `;

        await sequelize.query(query);
        console.log('Column confirmacionMetrologica added successfully.');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        await sequelize.close();
    }
}

addColumn();
