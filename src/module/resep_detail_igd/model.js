const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');
const resepIgd = require('../resep_igd/model');
const msBarang = require('../ms_barang/model');
const resepRacikIgd = require('../resep_racik_igd/model');

const resepDetailIgd = sq.define('resep_detail_igd', {
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
    status_resep_detail_igd:{
        type: DataTypes.BOOLEAN,
        defaultValue: true //true = aktif || false = tidak aktif
    },
    keterangan_resep_detail_igd:{
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });
    resepDetailIgd.belongsTo(resepIgd, { foreignKey: "resep_id" })
    resepIgd.hasMany(resepDetailIgd, { foreignKey: "resep_id" })

    resepDetailIgd.belongsTo(msBarang, { foreignKey: "awal_id_obat" })
    msBarang.hasMany(resepDetailIgd, { foreignKey: "awal_id_obat" })

    resepDetailIgd.belongsTo(msBarang, { foreignKey: "final_id_obat" })
    msBarang.hasMany(resepDetailIgd, { foreignKey: "final_id_obat" })

    resepDetailIgd.belongsTo(resepRacikIgd, { foreignKey: "resep_racik_igd_id" })
    resepRacikIgd.hasMany(resepDetailIgd, { foreignKey: "resep_racik_igd_id" })
    
module.exports = resepDetailIgd