const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const resepRnap = require('../resep_rnap/model');
const msBarang = require('../ms_barang/model');
const resepRacikRnap = require('../resep_racik_rnap/model');

const resepDetailRnap = sq.define('resep_detail_rnap', {
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
    awal_kronis:{
        type: DataTypes.BOOLEAN
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
    final_kronis:{
        type: DataTypes.BOOLEAN
    },
    final_aturan_pakai:{
        type: DataTypes.STRING
    },
    status_resep_detail_rnap:{
        type: DataTypes.BOOLEAN,
        defaultValue: true //true = aktif || false = tidak aktif
    },
    keterangan_resep_detail_rnap:{
        type: DataTypes.STRING
    }
},{
        paranoid: true,
        freezeTableName: true
    });
    resepDetailRnap.belongsTo(resepRnap, { foreignKey: "resep_id" })
    resepRnap.hasMany(resepDetailRnap, { foreignKey: "resep_id" })

    resepDetailRnap.belongsTo(msBarang, { foreignKey: "awal_id_obat" })
    msBarang.hasMany(resepDetailRnap, { foreignKey: "awal_id_obat" })

    resepDetailRnap.belongsTo(msBarang, { foreignKey: "final_id_obat" })
    msBarang.hasMany(resepDetailRnap, { foreignKey: "final_id_obat" })

    resepDetailRnap.belongsTo(resepRacikRnap, { foreignKey: "resep_racik_rnap_id" })
    resepRacikRnap.hasMany(resepDetailRnap, { foreignKey: "resep_racik_rnap_id" })

module.exports = resepDetailRnap