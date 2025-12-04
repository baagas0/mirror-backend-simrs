const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msPoliklinik = require('../ms_poliklinik/model')
const msDokter = require('../ms_dokter/model')
const msJenisLayanan = require('../ms_jenis_layanan/model')
const msJadwalDokter = require('../ms_jadwal_dokter/model')

const jadwalDokter = sq.define('jadwal_dokter', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_jadwal: {
        type: DataTypes.DATE
    },
    waktu_mulai: {
        type: DataTypes.TIME
    },
    waktu_selesai: {
        type: DataTypes.TIME
    },
    hari_jadwal: {
        type: DataTypes.STRING
    },
    tgl_perubahan: {
        type: DataTypes.DATE
    },
    hari_perubahan: {
        type: DataTypes.STRING
    },
    waktu_mulai_perubahan: {
        type: DataTypes.TIME
    },
    waktu_selesai_perubahan: {
        type: DataTypes.TIME
    },
    initial_jadwal: {
        type: DataTypes.STRING
    },
    quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    quota_jkn: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    quota_booking: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status_jadwal: {
        type: DataTypes.SMALLINT, // 1: aktif
        defaultValue: 1
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

jadwalDokter.belongsTo(msPoliklinik, { foreignKey: "ms_poliklinik_id" })
msPoliklinik.hasMany(jadwalDokter, { foreignKey: "ms_poliklinik_id" })

jadwalDokter.belongsTo(msDokter, { foreignKey: "ms_dokter_id" })
msDokter.hasMany(jadwalDokter, { foreignKey: "ms_dokter_id" })

jadwalDokter.belongsTo(msJenisLayanan, { foreignKey: "ms_jenis_layanan_id" })
msJenisLayanan.hasMany(jadwalDokter, { foreignKey: "ms_jenis_layanan_id" })

jadwalDokter.belongsTo(msJadwalDokter, { foreignKey: "ms_jadwal_dokter_id" })
msJadwalDokter.hasMany(jadwalDokter, { foreignKey: "ms_jadwal_dokter_id" })

module.exports = jadwalDokter