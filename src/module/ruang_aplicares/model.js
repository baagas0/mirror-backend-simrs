const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const ruangAplicares = sq.define('ruang_aplicares', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_ruang_aplicares: {
        type: DataTypes.STRING
    },
    kode_ruang_aplicares: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = ruangAplicares