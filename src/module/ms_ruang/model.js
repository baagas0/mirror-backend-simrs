const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msRuang = sq.define('ms_ruang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_ruang: {
        type: DataTypes.STRING
    },
    keterangan_ruang: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msRuang