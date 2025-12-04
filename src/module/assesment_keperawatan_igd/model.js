const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const registrasi= require('../registrasi/model')
const ms_diagnosa=require('../ms_diagnosa/model')


const assesment_keperawatan_igd = sq.define('assesment_keperawatan_igd', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    is_validasi:{
        type:DataTypes.BOOLEAN
    },
    tipe_diagnosa:{
        type:DataTypes.STRING
    },
    judul_diagnosa:{
        type:DataTypes.STRING
    },
    json_assesment_keperawatan_igd:{
        type:DataTypes.JSONB
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
    }
},
    {
        paranoid: true,
        freezeTableName: true
    }
);

assesment_keperawatan_igd.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(assesment_keperawatan_igd,{foreignKey:"registrasi_id"})

assesment_keperawatan_igd.belongsTo(ms_diagnosa,{
    foreignKey: {
        name: "ms_diagnosa_id", 
        allowNull:true
    }
})
ms_diagnosa.hasMany(assesment_keperawatan_igd,{
    foreignKey: {
        name: "ms_diagnosa_id", 
        allowNull:true
    }
})

module.exports = assesment_keperawatan_igd