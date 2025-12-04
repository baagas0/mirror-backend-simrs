const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msJenisFasilitas = sq.define('ms_jenis_fasilitas', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_jenis_fasilitas: {
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msJenisFasilitas