const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const user = require('../users/model');
const gudang = require('../ms_gudang/model');

const stockOpname = sq.define('stock_opname',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    tgl_stock_opname:{
        type:DataTypes.DATE
    },
    kode_stock_opname:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey: true
    },
    status_stock_opname:{
        type:DataTypes.INTEGER,
        defaultValue: 1         // 1: dibuat || 2: di acc
    },
    idgl_tambah:{
        type:DataTypes.STRING
    },
    idgl_kurang:{
        type:DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

stockOpname.belongsTo(user, { foreignKey: 'user_id' });
user.hasMany(stockOpname, { foreignKey: 'user_id' });

stockOpname.belongsTo(gudang, { foreignKey: 'ms_gudang_id' });
gudang.hasMany(stockOpname, { foreignKey: 'ms_gudang_id' });

module.exports = stockOpname