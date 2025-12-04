const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const registrasi= require('../registrasi/model')


const assesment_tambahan_rnap = sq.define('assesment_tambahan_rnap', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    is_validasi_askep:{
        type:DataTypes.BOOLEAN
    },
    json_askep:{
        type:DataTypes.JSONB
    },
    is_validasi_asmed:{
        type:DataTypes.BOOLEAN
    },
    json_asmed:{
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

assesment_tambahan_rnap.belongsTo(registrasi,{foreignKey:"registrasi_id"})
registrasi.hasMany(assesment_tambahan_rnap,{foreignKey:"registrasi_id"})

module.exports = assesment_tambahan_rnap