const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const pasien = require('../pasien/model');
const jadwal_dokter = require('../jadwal_dokter/model');
const user = require('../users/model');

const booking = sq.define('booking', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_booking: {
        type: DataTypes.STRING
    },
    jenis_booking: {
        type: DataTypes.STRING   //Mobile atau Onsite
    },
    no_rm: {
        type: DataTypes.STRING
    },
    nik_booking: {
        type: DataTypes.STRING
    },
    nama_booking: {
        type: DataTypes.STRING
    },
    no_hp_booking: {
        type: DataTypes.STRING
    },
    no_rujukan: {
        type: DataTypes.STRING
    },
    no_kontrol: {
        type: DataTypes.STRING
    },
    status_booking: {
        type: DataTypes.SMALLINT,  //0 :batal , 1 :aktif , 2 :diacc ,9: selesai
        defaultValue: 1
    },
    kode_booking: {
        type: DataTypes.STRING
    },
    flag_layanan: {
        type: DataTypes.INTEGER, // 0: non bpjs || 1: bpjs 
        defaultValue: 0
    },
    flag_kedatangan: {
        type: DataTypes.INTEGER, // 0: belum datang || 1: sudah datang 
        defaultValue: 0
    },
    waktu_kedatangan: {
        type: DataTypes.DATE
    },
    tujuan_booking: {
        type: DataTypes.INTEGER, // 1: mandiri || 2:rujukan || 3:kontrol 
    },
    foto_surat_rujukan: {
        type: DataTypes.STRING
    },
    remark: {
        type: DataTypes.TEXT
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

booking.belongsTo(pasien, { foreignKey: "pasien_id" })
pasien.hasMany(booking, { foreignKey: "pasien_id" })

booking.belongsTo(jadwal_dokter, { foreignKey: "jadwal_dokter_id" })
jadwal_dokter.hasMany(booking, { foreignKey: "jadwal_dokter_id" })

booking.belongsTo(user, { foreignKey: "user_id" })
user.hasMany(booking, { foreignKey: "user_id" })

module.exports = booking