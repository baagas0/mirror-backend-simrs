const {DataTypes} = require('sequelize');
const {sq} = require('../../config/connection');

const diagnosaKeperawatan = sq.define('diagnosa_keperawatan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_diagnosa: {
        type: DataTypes.STRING
    },
    nama_diagnosa: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

module.exports = diagnosaKeperawatan