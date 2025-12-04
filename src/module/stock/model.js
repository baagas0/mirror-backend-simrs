const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const barang = require('../ms_barang/model');
const gudang = require('../ms_gudang/model');
const pembelian = require('../pembelian/model');

const stock = sq.define('stock',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_batch:{
        type:DataTypes.STRING
    },
    qty:{
        type:DataTypes.FLOAT
    },
    tgl_masuk:{
        type:DataTypes.DATE
    },
    tgl_kadaluarsa:{
        type:DataTypes.DATE
    }
},
{
paranoid:true,
freezeTableName:true
});

stock.belongsTo(barang, { foreignKey: 'ms_barang_id' });
barang.hasMany(stock, { foreignKey: 'ms_barang_id' });

stock.belongsTo(gudang, { foreignKey: 'ms_gudang_id' });
gudang.hasMany(stock, { foreignKey: 'ms_gudang_id' });

stock.belongsTo(pembelian, { foreignKey: 'pembelian_id' });
pembelian.hasMany(stock, { foreignKey: 'pembelian_id' });


module.exports = stock