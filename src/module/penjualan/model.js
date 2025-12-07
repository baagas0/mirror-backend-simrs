const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const registrasi = require('../registrasi/model');
const kelasKunjungan = require('../kelas_kunjungan/model');
const asuransi = require('../ms_asuransi/model');
const gudang = require('../ms_gudang/model');
const dokter = require('../ms_dokter/model');
const jenisLayanan = require('../ms_jenis_layanan/model');
const penjualanExternal = require('../penjualan_external/model');

const penjualan = sq.define('penjualan',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_penjualan:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tgl_penjualan:{
        type:DataTypes.DATE
    },
    is_bmhp:{
        type:DataTypes.BOOLEAN, // jika penjualan = bahan medis habis pakai
        defaultValue: false
    },
    is_external:{
        type:DataTypes.BOOLEAN
    },
    jenis_rawat:{
        type:DataTypes.STRING       // dari registrasi RINAP/ RAJAL
    },
    NIK:{
        type:DataTypes.STRING
    },
    nama:{
        type:DataTypes.STRING
    },
    harga_total_barang:{
        type:DataTypes.FLOAT,
        defaultValue: 0              //2 angka di belakang koma
    },
    harga_total_jasa:{
        type:DataTypes.FLOAT,
        defaultValue: 0              //2 angka di belakang koma
    },
    harga_total_fasilitas:{
        type:DataTypes.FLOAT,
        defaultValue: 0              //2 angka di belakang koma
    },
    harga_total_bmhp:{
        type:DataTypes.FLOAT,
        defaultValue: 0              //2 angka di belakang koma - untuk BMHP operasi
    },
    discount:{
        type:DataTypes.FLOAT,
        defaultValue: 0              // dalam bentuk rupiah
    },
    tax:{
        type:DataTypes.FLOAT,
        defaultValue: 0              // dalam bentuk rupiah
    },
    total_penjualan:{
        type:DataTypes.FLOAT,
        defaultValue: 0        // total setalah di kurangi diskon dan tax
    },
    status_penjualan:{
        type:DataTypes.SMALLINT,
        defaultValue: 1         //1=buka, 2=kunci, 3=tutup
    },
    remark:{
        type:DataTypes.TEXT,    // CATATAN
        defaultValue: ''
    },
},
{
paranoid:true,
freezeTableName:true
});

penjualan.belongsTo(registrasi, { foreignKey: 'registrasi_id' });
registrasi.hasMany(penjualan, { foreignKey: 'registrasi_id' });

penjualan.belongsTo(kelasKunjungan, { foreignKey: 'kelas_kunjungan_id' });
kelasKunjungan.hasMany(penjualan, { foreignKey: 'kelas_kunjungan_id' });

penjualan.belongsTo(asuransi, { foreignKey: 'ms_asuransi_id' });
asuransi.hasMany(penjualan, { foreignKey: 'ms_asuransi_id' });

penjualan.belongsTo(gudang, { foreignKey: 'ms_gudang_id' });
gudang.hasMany(penjualan, { foreignKey: 'ms_gudang_id' });

penjualan.belongsTo(dokter, { foreignKey: 'ms_dokter_id' });
dokter.hasMany(penjualan, { foreignKey: 'ms_dokter_id' });

penjualan.belongsTo(jenisLayanan, { foreignKey: 'ms_jenis_layanan_id' });
jenisLayanan.hasMany(penjualan, { foreignKey: 'ms_jenis_layanan_id' });

penjualan.belongsTo(penjualanExternal, { foreignKey: 'penjualan_external_id' });
penjualanExternal.hasMany(penjualan, { foreignKey: 'penjualan_external_id' });

module.exports = penjualan