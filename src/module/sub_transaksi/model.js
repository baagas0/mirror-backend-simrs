const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const msGudang = require('../ms_gudang/model');
const subTransaksi = sq.define('sub_transaksi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    cc_name: {
        type: DataTypes.STRING
    },
    idgl: {
        type: DataTypes.STRING
    },
    tgl:{
        type: DataTypes.STRING
    },
    coa_code:{
        type: DataTypes.STRING
    },
    coa_name:{
        type: DataTypes.STRING
    },
    amount_debet:{
        type: DataTypes.FLOAT // aktif & tidak
    },
    amount_kredit:{
        type: DataTypes.FLOAT
    },
    remark:{
        type: DataTypes.STRING
    },
    identitas_transaksi:{
        type: DataTypes.STRING
    },
    penerima_id:{
        type: DataTypes.STRING
    },
    penerima_name:{
        type: DataTypes.STRING
    },
    sub_penerima_id:{
        type: DataTypes.STRING
    },
    sub_penerima_name:{
        type: DataTypes.STRING
    },
    type_penerima_id:{
        type: DataTypes.STRING
    },
    sub_type_penerima_id:{
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});
subTransaksi.belongsTo(msGudang, { foreignKey: 'cc' });
msGudang.hasMany(subTransaksi, { foreignKey: 'cc' });

module.exports = subTransaksi