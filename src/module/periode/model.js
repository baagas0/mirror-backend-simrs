const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const periode = sq.define('periode', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    is_periode_pertama: {
        type: DataTypes.BOOLEAN
    },
    tgl_sync: {
        type: DataTypes.DATE
    },
    tahun:{
        type: DataTypes.INTEGER
    },
    bulan:{
        type: DataTypes.INTEGER // start januari = 0
    },
    nama_bulan:{
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.BOOLEAN
    },
    remark:{
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = periode