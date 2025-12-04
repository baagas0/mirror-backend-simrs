const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const golonganKelasAplicares = sq.define('ms_golongan_kelas_aplicares', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_golongan_kelas_applicares: {
        type: DataTypes.STRING
    },
    kode_bridging: {
        type: DataTypes.STRING
    },
    kode_ruang: {
        type: DataTypes.STRING
    },
    keterangan_golongan_kelas_applicares: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = golonganKelasAplicares