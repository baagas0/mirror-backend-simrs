const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const transaksi = sq.define('transaksi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idgl: {
        type: DataTypes.STRING // contoh format code_uuid-> PJL_a1klm4 
    },
    tgl: {
        type: DataTypes.DATE
    },
    judul:{
        type: DataTypes.STRING
    },
    no_invoice:{
        type: DataTypes.STRING
    },
    remark:{
        type: DataTypes.STRING
    },
    amount_debet:{
        type: DataTypes.FLOAT
    },
    amount_kredit:{
        type: DataTypes.FLOAT
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = transaksi