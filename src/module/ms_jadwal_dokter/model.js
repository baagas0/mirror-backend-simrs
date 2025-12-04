const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msPoliklinik = require('../ms_poliklinik/model')
const msDokter = require('../ms_dokter/model')
const msJenisLayanan = require('../ms_jenis_layanan/model')

const msJadwalDokter = sq.define('ms_jadwal_dokter', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    hari_master: {
        type: DataTypes.STRING
    },
    waktu_mulai_master: {
        type: DataTypes.TIME
    },
    waktu_selesai_master: {
        type: DataTypes.TIME
    },
    quota_master: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    quota_jkn_master: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    quota_booking_master: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status_master: {
        type: DataTypes.SMALLINT, // 1: aktif
        defaultValue: 1
    },
    initial_master:{
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

msJadwalDokter.belongsTo(msPoliklinik, { foreignKey: "ms_poliklinik_id" })
msPoliklinik.hasMany(msJadwalDokter, { foreignKey: "ms_poliklinik_id" })

msJadwalDokter.belongsTo(msDokter, { foreignKey: "ms_dokter_id" })
msDokter.hasMany(msJadwalDokter, { foreignKey: "ms_dokter_id" })

msJadwalDokter.belongsTo(msJenisLayanan, { foreignKey: "ms_jenis_layanan_id" })
msJenisLayanan.hasMany(msJadwalDokter, { foreignKey: "ms_jenis_layanan_id" })

module.exports = msJadwalDokter