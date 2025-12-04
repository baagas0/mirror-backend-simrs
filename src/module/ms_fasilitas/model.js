const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msJenisFasilitas = require('../ms_jenis_fasilitas/model')
const tarifCbg = require('../tarif_cbg/model')

const msFasilitas = sq.define('ms_fasilitas', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_fasilitas: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

msFasilitas.belongsTo(msJenisFasilitas, { foreignKey: "ms_jenis_fasilitas_id" })
msJenisFasilitas.hasMany(msFasilitas, { foreignKey: "ms_jenis_fasilitas_id" })

msFasilitas.belongsTo(tarifCbg, { foreignKey: "tarif_cbg_id" })
tarifCbg.hasMany(msFasilitas, { foreignKey: "tarif_cbg_id" })

module.exports = msFasilitas