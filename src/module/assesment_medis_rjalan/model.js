const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const registrasi= require('../registrasi/model')


const assesment_medis_rjalan = sq.define('assesment_medis_rjalan', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    is_validasi:{
        type:DataTypes.BOOLEAN
    },
    json_assesment_medis_rjalan:{
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

assesment_medis_rjalan.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(assesment_medis_rjalan,{foreignKey:"registrasi_id"})

module.exports = assesment_medis_rjalan