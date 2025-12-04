const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');

const waktu = sq.define('waktu', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_waktu: {
        type: DataTypes.STRING
    },
    status_waktu: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = waktu