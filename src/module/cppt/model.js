const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const ms_tipe_tenaga_medis=require('../ms_tipe_tenaga_medis/model')
const registrasi = require('../registrasi/model')
const ms_dokter=require('../ms_dokter/model')


const cppt = sq.define('cppt', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    asesmen:{
        type:DataTypes.JSON
    },
    tanggal_cppt:{
        type:DataTypes.DATE
    },
    nama_tenaga_medis:{
        type:DataTypes.STRING
    },
    created_by:{
        type:DataTypes.STRING
    },
    created_name:{
        type:DataTypes.STRING
    },
    updated_by:{
        type:DataTypes.STRING
    },
    updated_name:{
        type:DataTypes.STRING
    },
    deleted_by:{
        type:DataTypes.STRING
    },
    deleted_name:{
        type:DataTypes.STRING
    },
    status_cppt:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

cppt.belongsTo(ms_tipe_tenaga_medis,{foreignKey:"ms_tipe_tenaga_medis_id"})
ms_tipe_tenaga_medis.hasMany(cppt,{foreignKey:"ms_tipe_tenaga_medis_id"})

cppt.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(cppt,{foreignKey:"registrasi_id"})

cppt.belongsTo(ms_dokter,{foreignKey:"ms_dokter_id"})
ms_dokter.hasMany(cppt,{foreignKey:"ms_dokter_id"})






module.exports = cppt