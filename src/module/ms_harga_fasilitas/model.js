const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msFasilitas = require('../ms_fasilitas/model')
const msTarif = require('../ms_tarif/model')
const msHarga = require('../ms_harga/model')

const msHargaFasilitas = sq.define('ms_harga_fasilitas', {
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

msHargaFasilitas.belongsTo(msFasilitas, { foreignKey: "ms_fasilitas_id" })
msFasilitas.hasMany(msHargaFasilitas, { foreignKey: "ms_fasilitas_id" })

msHargaFasilitas.belongsTo(msTarif, { foreignKey: "ms_tarif_id" })
msTarif.hasMany(msHargaFasilitas, { foreignKey: "ms_tarif_id" })

msHargaFasilitas.belongsTo(msHarga, { foreignKey: "ms_harga_id" })
msHarga.hasMany(msHargaFasilitas, { foreignKey: "ms_harga_id" })

module.exports = msHargaFasilitas