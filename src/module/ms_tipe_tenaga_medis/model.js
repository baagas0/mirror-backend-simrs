const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const ms_tipe_tenaga_medis = sq.define('ms_tipe_tenaga_medis', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_tipe_tenaga_medis: {
        type: DataTypes.STRING
    },
    nama_tipe_tenaga_medis: {
        type: DataTypes.STRING
    },
    keterangan_tipe_tenaga_medis:{
        type:DataTypes.TEXT
    },
    status_tipe_tenaga_medis: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = ms_tipe_tenaga_medis