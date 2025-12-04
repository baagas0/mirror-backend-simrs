const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');

const penunjang=require('../penunjang/model')
const penjualan=require('../penjualan/model')
const ms_fasilitas=require('../ms_fasilitas/model')

const penjualan_penunjang = sq.define('penjualan_penunjang', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    status_penjualan_penunjang:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
    },
    keterangan_penjualan_penunjang:{
        type:DataTypes.TEXT
    },
    qty_penjualan_penunjang:{
        type:DataTypes.FLOAT
    },
    harga_penjualan_penunjang:{
        type:DataTypes.FLOAT
    },
    harga_custom_penjualan_penunjang:{
        type:DataTypes.FLOAT
    }
},
    {
        paranoid: true,
        freezeTableName: true
    });

penjualan_penunjang.belongsTo(penunjang,{foreignKey:"penunjang_id"})
penunjang.hasMany(penjualan_penunjang,{foreignKey:"penunjang_id"})

penjualan_penunjang.belongsTo(penjualan,{foreignKey:"penjualan_id"})
penjualan.hasMany(penjualan_penunjang,{foreignKey:"penjualan_id"})

// penjualan_penunjang.belongsTo(ms_fasilitas,{foreignKey:"ms_fasilitas_id"})
// ms_fasilitas.hasMany(penjualan_penunjang,{foreignKey:"ms_fasilitas_id"})



module.exports = penjualan_penunjang