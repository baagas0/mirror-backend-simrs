const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msSatuanBarang = sq.define('ms_satuan_barang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_satuan: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msSatuanBarang