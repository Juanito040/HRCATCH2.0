const sequelize = require('../config/configDb');

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        const query = `
      ALTER TABLE Servicio
      ADD COLUMN requiereMesaServicios TINYINT(1) NOT NULL DEFAULT 0;
    `;

        await sequelize.query(query);
        console.log('Column added successfully.');
    } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        await sequelize.close();
    }
}

addColumn();
