const sequelize = require('../config/configDb');

async function insertRole() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        // Forcing ID 9 as requested. 
        // Using raw query to ensure we can specify the ID if it's an auto-increment column.
        const query = `
            INSERT INTO Rol (id, nombre, createdAt, updatedAt)
            VALUES (9, 'MESAADMIN', NOW(), NOW())
            ON DUPLICATE KEY UPDATE nombre = 'MESAADMIN', updatedAt = NOW();
        `;

        await sequelize.query(query);
        console.log('Role MESAADMIN (ID 9) inserted/updated successfully.');
    } catch (error) {
        console.error('Error inserting role:', error);
    } finally {
        await sequelize.close();
    }
}

insertRole();
