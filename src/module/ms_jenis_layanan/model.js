const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msJenisLayanan = sq.define('ms_jenis_layanan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_jenis_layanan: {
        type: DataTypes.STRING
    },
    kode_bridge: {
        type: DataTypes.STRING
    },
    kode_jenis_layanan: {
        type: DataTypes.STRING // IGD || RINAP || RJALAN 
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msJenisLayanan