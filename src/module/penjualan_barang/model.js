const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const penjualan = require('../penjualan/model');
const msBarang = require('../ms_barang/model');

const penjualanBarang = sq.define('penjualan_barang',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    qty_barang:{
        type:DataTypes.INTEGER
    },
    harga_barang:{
        type:DataTypes.FLOAT        //2 angka di belakang koma
    },
    harga_barang_custom:{
        type:DataTypes.FLOAT        //2 angka di belakang koma
    },
    harga_pokok_barang:{
        type:DataTypes.FLOAT        //2 angka di belakang koma
    },
    keterangan_penjualan_barang:{
        type:DataTypes.STRING
    },
    status_penjualan_barang:{
        type:DataTypes.SMALLINT,
        defaultValue: 1         //1=buka, 2=kunci
    }
},
{
paranoid:true,
freezeTableName:true
});

penjualanBarang.belongsTo(penjualan, { foreignKey: 'penjualan_id' });
penjualan.hasMany(penjualanBarang, { foreignKey: 'penjualan_id' });

penjualanBarang.belongsTo(msBarang, { foreignKey: 'ms_barang_id' });
msBarang.hasMany(penjualanBarang, { foreignKey: 'ms_barang_id' });

module.exports = penjualanBarang