const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const adjustment = require('../adjustment/model');
const stock = require('../stock/model');

const subAdjustment = sq.define('sub_adjustment', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    qty_stock_adjustment: {
        type: DataTypes.FLOAT
    },
},
    {
        paranoid: true,
        freezeTableName: true
    });

subAdjustment.belongsTo(adjustment, { foreignKey: 'adjustment_id' });
adjustment.hasMany(subAdjustment, { foreignKey: 'adjustment_id' });

subAdjustment.belongsTo(stock, { foreignKey: 'stock_id' });
stock.hasMany(subAdjustment, { foreignKey: 'stock_id' });

module.exports = subAdjustment