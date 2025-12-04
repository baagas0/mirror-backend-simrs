const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const registrasi = require('../registrasi/model')
const msBed = require('../ms_bed/model')

const historyBed = sq.define('history_bed', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_mulai: {
        type: DataTypes.DATE
    },
    tgl_selesai: {
        type: DataTypes.DATE            
    },
    status_monitoring:{
        type:DataTypes.SMALLINT, // 0: tidak terpakai || 1: terpakai
        defaultValue : 1
    },
    status_checkout: {
        type: DataTypes.SMALLINT,
        defaultValue:0 // 0: belum checkout || 1:sudah checkout
    },
    keterangan_history_bed: {
        type: DataTypes.STRING             
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

historyBed.belongsTo(registrasi, { foreignKey: "registrasi_id" })
registrasi.hasMany(historyBed, { foreignKey: "registrasi_id" })

historyBed.belongsTo(msBed, { foreignKey: "ms_bed_id" })
msBed.hasMany(historyBed, { foreignKey: "ms_bed_id" })


module.exports = historyBed