const { DataTypes } = require('sequelize');
const { sq } = require('../../config/connection');
const mutasi = require('../mutasi/model');
const stock = require('../stock/model');

const subMutasi = sq.define('sub_mutasi', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    qty_sub: {
        type: DataTypes.FLOAT
    }
}, {
    paranoid: true,
    freezeTableName: true
});

subMutasi.belongsTo(mutasi,{foreignKey:'mutasi_id'});
mutasi.hasMany(subMutasi,{foreignKey:'mutasi_id'});

subMutasi.belongsTo(stock,{foreignKey:'stock_id'});
stock.hasMany(subMutasi,{foreignKey:'stock_id'});

module.exports = subMutasi