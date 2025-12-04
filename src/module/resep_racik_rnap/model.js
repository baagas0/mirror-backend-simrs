const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const resepRnap = require('../resep_rnap/model');

const resepRacikRnap = sq.define('resep_racik_rnap', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_racik: {
        type: DataTypes.STRING
    },
    qty: {
        type: DataTypes.FLOAT
    },
    signa: {
        type: DataTypes.STRING
    },
    satuan: {
        type: DataTypes.STRING
    },
    kronis: {
        type: DataTypes.BOOLEAN
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    aturan_pakai: {
        type: DataTypes.STRING
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

resepRacikRnap.belongsTo(resepRnap, { foreignKey: 'resep_rnap_id' })
resepRnap.hasMany(resepRacikRnap, { foreignKey: 'resep_rnap_id' })

module.exports = resepRacikRnap