const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msJenisObat = sq.define('ms_jenis_obat', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_jenis_obat: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msJenisObat