const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const resepRjalan = require('../resep_rjalan/model');
const msBarang = require('../ms_barang/model');
const resepRacik = require('../resep_racik/model');

const resepDetailRjalan = sq.define('resep_detail_rjalan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    awal_nama_obat: {
        type: DataTypes.STRING
    },
    awal_signa: {
        type: DataTypes.STRING
    },
    awal_harga:{
        type: DataTypes.DOUBLE
    },
    awal_qty:{
        type: DataTypes.FLOAT
    },
    awal_satuan:{
        type: DataTypes.STRING
    },
    awal_aturan_pakai:{
        type: DataTypes.STRING
    },
    final_nama_obat: {
        type: DataTypes.STRING
    },
    final_signa: {
        type: DataTypes.STRING
    },
    final_harga:{
        type: DataTypes.DOUBLE
    },
    final_qty:{
        type: DataTypes.FLOAT
    },
    final_satuan:{
        type: DataTypes.STRING
    },
    final_aturan_pakai:{
        type: DataTypes.STRING
    },
    status_resep_detail_rjalan:{
        type: DataTypes.BOOLEAN,
        defaultValue: true //true = aktif || false = tidak aktif
    },
    keterangan_resep_detail_rjalan:{
        type: DataTypes.STRING
    },
    produk_kfa_id: {
        type: DataTypes.STRING
    },
    ihs_medication_id: {
        type: DataTypes.STRING
    },
    ihs_medication_request_id: {
        type: DataTypes.STRING
    },
    ihs_pengkajian_obat_id: {
        type: DataTypes.STRING
    },
    ihs_pengeluaran_obat_id: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });
    resepDetailRjalan.belongsTo(resepRjalan, { foreignKey: "resep_id" })
    resepRjalan.hasMany(resepDetailRjalan, { foreignKey: "resep_id" })

    resepDetailRjalan.belongsTo(msBarang, { foreignKey: "awal_id_obat" })
    msBarang.hasMany(resepDetailRjalan, { foreignKey: "awal_id_obat" })

    resepDetailRjalan.belongsTo(msBarang, { foreignKey: "final_id_obat" })
    msBarang.hasMany(resepDetailRjalan, { foreignKey: "final_id_obat" })

    resepDetailRjalan.belongsTo(resepRacik, { foreignKey: "resep_racik_id" })
    resepRacik.hasMany(resepDetailRjalan, { foreignKey: "resep_racik_id" })
    
module.exports = resepDetailRjalan