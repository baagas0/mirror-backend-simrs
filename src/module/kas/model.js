const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const kas = sq.define('kas', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    coa_code: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    no_rek:{
        type: DataTypes.STRING
    },
    contact_person:{
        type: DataTypes.STRING
    },
    telp:{
        type: DataTypes.STRING
    },
    hp:{
        type: DataTypes.STRING
    }
}, {
    paranoid: true,
    freezeTableName: true
});

module.exports = kas