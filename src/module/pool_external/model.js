const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const penjualan = require('../penjualan/model');
const tagihan = require('../tagihan/model');


const poolExternal = sq.define('pool_external',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    }
},
{
paranoid:true,
freezeTableName:true
});

poolExternal.belongsTo(penjualan, { foreignKey: 'penjualan_id' });
penjualan.hasMany(poolExternal, { foreignKey: 'penjualan_id' });

poolExternal.belongsTo(tagihan, { foreignKey: 'tagihan_id' });
tagihan.hasMany(poolExternal, { foreignKey: 'tagihan_id' });

module.exports = poolExternal