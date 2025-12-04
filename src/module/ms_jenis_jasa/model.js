const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msJenisJasa = sq.define('ms_jenis_jasa', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_jenis_jasa: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msJenisJasa