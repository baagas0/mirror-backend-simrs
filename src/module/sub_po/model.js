const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const pembelian = require('../pembelian/model');
const barang = require('../ms_barang/model');

const subPO = sq.define('sub_po',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    total_qty_satuan_simpan:{
        type:DataTypes.FLOAT
    }
},
{
paranoid:true,
freezeTableName:true
});

subPO.belongsTo(pembelian, { foreignKey: 'pembelian_id' });
pembelian.hasMany(subPO, { foreignKey: 'pembelian_id' });

subPO.belongsTo(barang, { foreignKey: 'ms_barang_id' });
barang.hasMany(subPO, { foreignKey: 'ms_barang_id' });

module.exports = subPO