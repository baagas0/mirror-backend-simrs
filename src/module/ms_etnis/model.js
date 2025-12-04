const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msEtnis = sq.define('ms_etnis', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_etnis: {
        type: DataTypes.STRING
    },
    keterangan_etnis: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msEtnis