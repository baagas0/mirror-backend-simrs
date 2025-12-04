const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msHarga = sq.define('ms_harga', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_harga: {
        type: DataTypes.STRING
    },
    keterangan: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msHarga