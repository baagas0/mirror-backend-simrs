const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msTarif = sq.define('ms_tarif', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_tarif: {
        type: DataTypes.STRING
    },
    keterangan: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msTarif