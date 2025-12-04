const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const msPoliklinik = sq.define('ms_poliklinik',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_poliklinik:{
        type:DataTypes.STRING
    },
    kode_poliklinik:{
        type:DataTypes.STRING
    },
    kode_poli_bpjs:{
        type:DataTypes.STRING
    },
    satu_sehat_id:{
        type:DataTypes.STRING
    },
    nama_subspesialis:{
        type:DataTypes.STRING
    },
    kode_subspesialis:{
        type:DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

module.exports = msPoliklinik