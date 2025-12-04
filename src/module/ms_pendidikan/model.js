const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msPendidikan = sq.define('ms_pendidikan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_pendidikan: {
        type: DataTypes.STRING
    },
    keterangan_pendidikan: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msPendidikan