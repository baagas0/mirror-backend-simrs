const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msTarif = require('../ms_tarif/model')
const msHarga = require('../ms_harga/model')

const formulaHarga = sq.define('formula_harga', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    persentase: {
        type:DataTypes.FLOAT
    },
    keterangan: {
        type:DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

formulaHarga.belongsTo(msTarif, { foreignKey: "ms_tarif_id" })
msTarif.hasMany(formulaHarga, { foreignKey: "ms_tarif_id" })

formulaHarga.belongsTo(msHarga, { foreignKey: "ms_harga_id" })
msHarga.hasMany(formulaHarga, { foreignKey: "ms_harga_id" })

module.exports = formulaHarga