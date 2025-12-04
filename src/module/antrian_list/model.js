const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const booking = require('../booking/model')
const jadwal_dokter = require('../jadwal_dokter/model')
const msLoket = require('../ms_loket/model')
const jenisAntrian = require('../jenis_antrian/model')
const registrasi = require('../registrasi/model')
const layananRuang = require('../layanan_ruang/model')

const antrian_list = sq.define('antrian_list', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_antrian: {
        type: DataTypes.DATE
    },
    is_master: {
        type: DataTypes.SMALLINT,
        defaultValue: 1 //0:not master, 1 : master
    },
    poli_layanan: {
        type: DataTypes.SMALLINT  //1.Loket  || 2.Poli || 3. layanan || 4.Farmasi || 5.Kasir ||
    },
    initial: {
        type: DataTypes.STRING
    },
    antrian_no: {
        type: DataTypes.INTEGER
    },
    sequence: {
        type: DataTypes.INTEGER
    },
    status_antrian: {
        type: DataTypes.SMALLINT,
        defaultValue: 1     //0: batal || 1: dibuat || 2: proses || 9: selesai  
    },
    kode_booking_bpjs: {
        type: DataTypes.STRING      //kode bpjs untuk buat antrian
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

antrian_list.belongsTo(booking, { foreignKey: "booking_id" })
booking.hasMany(antrian_list, { foreignKey: "booking_id" })

antrian_list.belongsTo(jadwal_dokter, { foreignKey: "jadwal_dokter_id" })
jadwal_dokter.hasMany(antrian_list, { foreignKey: "jadwal_dokter_id" })

antrian_list.belongsTo(msLoket, { foreignKey: "ms_loket_id" })
msLoket.hasMany(antrian_list, { foreignKey: "ms_loket_id" })

antrian_list.belongsTo(jenisAntrian, { foreignKey: "jenis_antrian_id" })
jenisAntrian.hasMany(antrian_list, { foreignKey: "jenis_antrian_id" })

antrian_list.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(antrian_list, { foreignKey: "registrasi_id" })

antrian_list.belongsTo(layananRuang, { foreignKey: "layanan_ruang_id" })
layananRuang.hasMany(antrian_list, { foreignKey: "layanan_ruang_id" })

module.exports = antrian_list