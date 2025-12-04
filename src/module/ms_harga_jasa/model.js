const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msJasa = require('../ms_jasa/model')
const msTarif = require('../ms_tarif/model')
const msHarga = require('../ms_harga/model')

const msHargaJasa = sq.define('ms_harga_jasa', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    harga_beli: {
        type:DataTypes.FLOAT
    },
    harga_jual: {
        type:DataTypes.FLOAT
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

msHargaJasa.belongsTo(msJasa, { foreignKey: "ms_jasa_id" })
msJasa.hasMany(msHargaJasa, { foreignKey: "ms_jasa_id" })

msHargaJasa.belongsTo(msTarif, { foreignKey: "ms_tarif_id" })
msTarif.hasMany(msHargaJasa, { foreignKey: "ms_tarif_id" })

msHargaJasa.belongsTo(msHarga, { foreignKey: "ms_harga_id" })
msHarga.hasMany(msHargaJasa, { foreignKey: "ms_harga_id" })

module.exports = msHargaJasa