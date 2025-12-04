const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const resepRjalan = require('../resep_rjalan/model');
const resepRacik = sq.define('resep_racik', {
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

resepRacik.belongsTo(resepRjalan, { foreignKey: 'resep_rjalan_id' })
resepRjalan.hasMany(resepRacik, { foreignKey: 'resep_rjalan_id' })

module.exports = resepRacik