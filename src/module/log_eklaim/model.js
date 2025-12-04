const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const logEklaim = sq.define('log_eklaim', {
    id:{
        type:DataTypes.STRING,
        primaryKey:true
    },
    payload_default:{
        type:DataTypes.JSON
    },
    payload_encrypted:{
        type:DataTypes.TEXT
    },
    status:{
        type:DataTypes.STRING
    },
    code:{
        type:DataTypes.STRING
    },
    message:{
        type:DataTypes.STRING
    },
    response:{
        type:DataTypes.JSON
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = logEklaim