const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msSupplier = sq.define('ms_supplier', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_supplier: {
        type: DataTypes.STRING
    },
    no_hp_supplier: {
        type:DataTypes.STRING
    },
    alamat_supplier: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msSupplier