const { DataTypes } = require('sequelize');
const sequelize = require('../../config/configDb');

const BackupSistema = sequelize.define('BackupSistema', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sistemaInformacionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.STRING
    },
    observacion: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'BackupSistema',
    timestamps: true
});

module.exports = BackupSistema;
