const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msGolonganDarah = sq.define('ms_golongan_darah', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_golongan_darah: {
        type: DataTypes.STRING
    },
    keterangan_golongan_darah: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msGolonganDarah