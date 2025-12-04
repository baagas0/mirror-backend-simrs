const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const msKelasKamar = require('../ms_kelas_kamar/model');
const msKamar = require('../ms_kamar/model');
const ruangAplicares = require('../ruang_aplicares/model');
const golonganKelasAplicares = require('../ms_golongan_kelas_aplicares/model');
const kelasKamarSirOnline = require('../ms_kelas_kamar_sirsonline/model');
const msJenisLayanan = require('../ms_jenis_layanan/model');


const msBed = sq.define('ms_bed', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_bed: {
        type: DataTypes.STRING
    },
    cek_bridging: {
        type: DataTypes.SMALLINT, // 0:tidak aktif || 1 :aktif
        defaultValue: 0
    },
    status_bed: {
        type: DataTypes.SMALLINT, // 0:tidak aktif || 1 :aktif
        defaultValue: 1
    },
    keterangan_bed: {
        type:DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

msBed.belongsTo(msKelasKamar,{foreignKey:'ms_kelas_kamar_id'});
msKelasKamar.hasMany(msBed,{foreignKey:'ms_kelas_kamar_id'});

msBed.belongsTo(msKamar,{foreignKey:'ms_kamar_id'});
msKamar.hasMany(msBed,{foreignKey:'ms_kamar_id'});

msBed.belongsTo(ruangAplicares,{foreignKey:'ruang_aplicares_id'});
ruangAplicares.hasMany(msBed,{foreignKey:'ruang_aplicares_id'});

msBed.belongsTo(golonganKelasAplicares,{foreignKey:'golongan_kelas_aplicares_id'});
golonganKelasAplicares.hasMany(msBed,{foreignKey:'golongan_kelas_aplicares_id'});

msBed.belongsTo(kelasKamarSirOnline,{foreignKey:'kelas_kamar_sirsonline_id'});
kelasKamarSirOnline.hasMany(msBed,{foreignKey:'kelas_kamar_sirsonline_id'});

msBed.belongsTo(msJenisLayanan,{foreignKey:'ms_jenis_layanan_id'});
msJenisLayanan.hasMany(msBed,{foreignKey:'ms_jenis_layanan_id'});

module.exports = msBed