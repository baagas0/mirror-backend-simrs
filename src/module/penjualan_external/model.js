const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const pasien = require('../pasien/model');

const penjualanExternal = sq.define('penjualan_external',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_penjualan_external:{
        type:DataTypes.STRING       // nama pasien
    },
    alamat_penjualan_external:{     //alamat pasien
        type:DataTypes.STRING       
    },
    keterangan_penjualan_external:{
        type:DataTypes.STRING
    }      
},
{
    paranoid:true,
    freezeTableName:true
});

penjualanExternal.belongsTo(pasien, { foreignKey: 'pasien_id' });
pasien.hasMany(penjualanExternal, { foreignKey: 'pasien_id' });

module.exports = penjualanExternal