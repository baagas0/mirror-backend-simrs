const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msPekerjaan = sq.define('ms_pekerjaan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_pekerjaan: {
        type: DataTypes.STRING
    },
    keterangan_pekerjaan: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msPekerjaan