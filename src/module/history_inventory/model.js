const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const gudang = require('../ms_gudang/model');
const stock = require('../stock/model');
const barang = require('../ms_barang/model');

const historyInventory = sq.define('history_inventory',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tipe_transaksi:{
        type:DataTypes.STRING
    },
    transaksi_id:{
        type:DataTypes.STRING
    },
    debit_kredit:{
        type:DataTypes.STRING
    },
    stok_awal_per_gudang:{
        type:DataTypes.FLOAT
    },
    stok_akhir_per_gudang:{
        type:DataTypes.FLOAT
    },
    stok_awal_per_batch:{
        type:DataTypes.FLOAT
    },
    stok_akhir_per_batch:{
        type:DataTypes.FLOAT
    },
    qty:{
        type:DataTypes.FLOAT
    },
    harga_pokok_awal:{
        type:DataTypes.FLOAT
    },
    harga_pokok_akhir:{
        type:DataTypes.FLOAT
    },
    tgl_transaksi:{
        type:DataTypes.DATE
    }
},
{
paranoid:true,
freezeTableName:true
});

historyInventory.belongsTo(gudang, { foreignKey: 'ms_gudang_id' });
gudang.hasMany(historyInventory, { foreignKey: 'ms_gudang_id' });

historyInventory.belongsTo(stock, { foreignKey: 'stock_id' });
stock.hasMany(historyInventory, { foreignKey: 'stock_id' });

historyInventory.belongsTo(gudang, { foreignKey: 'gudang_tambahan_id' });
gudang.hasMany(historyInventory, { foreignKey: 'gudang_tambahan_id' });

historyInventory.belongsTo(barang, { foreignKey: 'ms_barang_id' });
barang.hasMany(historyInventory, { foreignKey: 'ms_barang_id' });


module.exports = historyInventory