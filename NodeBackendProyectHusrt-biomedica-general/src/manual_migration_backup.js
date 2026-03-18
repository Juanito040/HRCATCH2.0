const sequelize = require('../config/configDb');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        // Create BackupSistema table
        try {
            await sequelize.query(`
                CREATE TABLE IF NOT EXISTS BackupSistema (
                    id INTEGER NOT NULL AUTO_INCREMENT,
                    sistemaInformacionId INTEGER NOT NULL,
                    fecha DATE NOT NULL,
                    tipo VARCHAR(255) NULL,
                    estado VARCHAR(255) NULL,
                    observacion TEXT NULL,
                    createdAt DATETIME NOT NULL,
                    updatedAt DATETIME NOT NULL,
                    PRIMARY KEY (id),
                    CONSTRAINT BackupSistema_sistemaInformacionId_fk
                        FOREIGN KEY (sistemaInformacionId)
                        REFERENCES sistemasinformacion(id)
                        ON UPDATE CASCADE
                        ON DELETE CASCADE
                );
            `);
            console.log('Table BackupSistema created successfully.');
        } catch (error) {
            console.log('Table BackupSistema creation failed:', error.message);
        }

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
