const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msLayanan = require('../ms_layanan/model')

const layananRuang = sq.define('layanan_ruang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_layanan_ruang: {
        type: DataTypes.STRING
    },
    initial_layanan_ruang: {
        type: DataTypes.STRING
    },
    status_layanan_ruang: {
        type: DataTypes.SMALLINT
    },
    keterangan_layanan_ruang: {
        type: DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

layananRuang.belongsTo(msLayanan, { foreignKey: "ms_layanan_id" })
msLayanan.hasMany(layananRuang, { foreignKey: "ms_layanan_id" })

module.exports = layananRuang