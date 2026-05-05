const sequelize = require('../../config/configDb');
const { DataTypes } = require('sequelize');

async function addColumn() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        await queryInterface.addColumn('TipoEquipo', 'requiereMetrologia', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
        console.log('Columna requiereMetrologia agregada con éxito.');
    } catch (error) {
        console.error('Error al agregar la columna:', error);
    } finally {
        process.exit();
    }
}

addColumn();
