const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const jenis_penunjang=require('../jenis_penunjang/model')
const tarif_cbg=require('../tarif_cbg/model')

const penunjang = sq.define('penunjang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_penunjang: {
        type: DataTypes.STRING
    },
    status_penunjang:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    keterangan_penunjang:{
        type:DataTypes.TEXT
    },
    parameter_normal:{
        type:DataTypes.STRING
    },
    satuan:{
        type:DataTypes.STRING
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

penunjang.belongsTo(jenis_penunjang,{foreignKey:"jenis_penunjang_id"})
jenis_penunjang.hasMany(penunjang,{foreignKey:"jenis_penunjang_id"})

penunjang.belongsTo(tarif_cbg,{foreignKey:"tarif_cbg_id"})
tarif_cbg.hasMany(penunjang,{foreignKey:"tarif_cbg_id"})

module.exports = penunjang