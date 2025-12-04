const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msGudang = sq.define('ms_gudang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    ms_gudang_utama_id: {
        type: DataTypes.STRING
    },
    nama_gudang: {
        type: DataTypes.STRING
    },
    tipe_gudang: {
        type: DataTypes.STRING
    },
    is_utama:{
        type: DataTypes.SMALLINT //0 = parent || 1 = child
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msGudang