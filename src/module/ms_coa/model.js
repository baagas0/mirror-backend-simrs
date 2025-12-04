const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const msCoa = sq.define('ms_coa', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    code: {
        type: DataTypes.STRING
    },
    parent_code: {
        type: DataTypes.STRING
    },
    d_k:{
        type: DataTypes.STRING
    },
    name:{
        type: DataTypes.STRING
    },
    remark:{
        type: DataTypes.STRING
    },
    status:{
        type: DataTypes.BOOLEAN // aktif & tidak
    },
    level:{
        type: DataTypes.INTEGER
    },
    saldo_awal:{
        type: DataTypes.FLOAT
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = msCoa