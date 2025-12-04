const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msJenisJasa = require('../ms_jenis_jasa/model')
const tarifCbg = require('../tarif_cbg/model')

const msJasa = sq.define('ms_jasa', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_jasa: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

msJasa.belongsTo(msJenisJasa, { foreignKey: "ms_jenis_jasa_id" })
msJenisJasa.hasMany(msJasa, { foreignKey: "ms_jenis_jasa_id" })

msJasa.belongsTo(tarifCbg, { foreignKey: "tarif_cbg_id" })
tarifCbg.hasMany(msJasa, { foreignKey: "tarif_cbg_id" })

module.exports = msJasa