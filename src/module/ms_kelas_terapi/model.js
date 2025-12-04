const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msKelasTerapi = sq.define('ms_kelas_terapi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kelas_terapi: {
        type: DataTypes.STRING
    },
    is_narkotik:{
        type: DataTypes.BOOLEAN
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msKelasTerapi