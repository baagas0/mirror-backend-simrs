const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msGolonganBarang = sq.define('ms_golongan_barang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_golongan_barang: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msGolonganBarang