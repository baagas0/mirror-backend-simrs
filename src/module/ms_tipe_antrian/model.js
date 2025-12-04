const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msTipeAntrian = sq.define('ms_tipe_antrian', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_tipe_antrian: {
        type: DataTypes.STRING
    },
    kode_tipe_antrian: {
        type: DataTypes.STRING
    },
    status_tipe_antrian: {
        type: DataTypes.SMALLINT,  // 1 = aktif, 0 = non aktif
        defaultValue: 1
    },
    keterangan_tipe_antrian: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });
    // rawat jalan, rawat inap, online, lab

module.exports = msTipeAntrian