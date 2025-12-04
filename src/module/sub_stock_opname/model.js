const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const stock = require('../stock/model');
const stockOpname = require('../stock_opname/model');

const subStockOpname = sq.define('sub_stock_opname',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    qty_stock_opname:{
        type:DataTypes.FLOAT
    }
},
{
paranoid:true,
freezeTableName:true
});

subStockOpname.belongsTo(stock, { foreignKey: 'stock_id' });
stock.hasMany(subStockOpname, { foreignKey: 'stock_id' });

subStockOpname.belongsTo(stockOpname, { foreignKey: 'stock_opname_id' });
stockOpname.hasMany(subStockOpname, { foreignKey: 'stock_opname_id' });

module.exports = subStockOpname