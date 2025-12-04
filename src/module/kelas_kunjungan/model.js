const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msTarif = require('../ms_tarif/model')

const kelasKunjungan = sq.define('kelas_kunjungan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kelas_kunjungan: {
        type: DataTypes.STRING(50)
    },
    keterangan_kelas_kunjungan: {
        type: DataTypes.STRING(100)
    },
    status_kelas_kunjungan: {
        type: DataTypes.SMALLINT
    },
    kode_kelas_kunjungan: {
        type: DataTypes.STRING(10)
    }
}, {
    paranoid: true,
    freezeTableName: true
});

kelasKunjungan.belongsTo(msTarif, { foreignKey: "ms_tarif_id" })
msTarif.hasMany(kelasKunjungan, { foreignKey: "ms_tarif_id" })

module.exports = kelasKunjungan