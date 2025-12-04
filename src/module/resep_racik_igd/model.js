const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const resepIgd = require('../resep_igd/model');

const resepRacikIgd = sq.define('resep_racik_igd', {
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

resepRacikIgd.belongsTo(resepIgd, { foreignKey: 'resep_igd_id' })
resepIgd.hasMany(resepRacikIgd, { foreignKey: 'resep_igd_id' })

module.exports = resepRacikIgd