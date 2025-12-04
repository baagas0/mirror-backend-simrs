const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const kelasKamarSirOnline = sq.define('ms_kelas_kamar_sironline', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kelas_kamar_sironline: {
        type: DataTypes.STRING
    },
    kode_bridging_sirs: {
        type: DataTypes.STRING
    },
    keterangan_kamar_sironline: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = kelasKamarSirOnline