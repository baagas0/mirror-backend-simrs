const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const penunjang = require('../penunjang/model')
const msTarif = require('../ms_tarif/model')
const msHarga = require('../ms_harga/model')

const ms_harga_penunjang = sq.define('ms_harga_penunjang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    harga_beli_penunjang: {
        type:DataTypes.FLOAT
    },
    harga_jual_penunjang: {
        type:DataTypes.FLOAT
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

ms_harga_penunjang.belongsTo(penunjang, { foreignKey: "penunjang_id" })
penunjang.hasMany(ms_harga_penunjang, { foreignKey: "penunjang_id" })

ms_harga_penunjang.belongsTo(msTarif, { foreignKey: "ms_tarif_id" })
msTarif.hasMany(ms_harga_penunjang, { foreignKey: "ms_tarif_id" })

ms_harga_penunjang.belongsTo(msHarga, { foreignKey: "ms_harga_id" })
msHarga.hasMany(ms_harga_penunjang, { foreignKey: "ms_harga_id" })

module.exports = ms_harga_penunjang