const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const ms_gudang=require('../ms_gudang/model')

const rad_test = sq.define('rad_test',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_rad_test:{
        type:DataTypes.STRING
    },
    keterangan_rad_test:{
        type:DataTypes.TEXT
    },
    created_by:{
        type:DataTypes.STRING
    },
    created_name:{
        type:DataTypes.STRING
    },
    updated_by:{
        type:DataTypes.STRING
    },
    updated_name:{
        type:DataTypes.STRING
    },
    deleted_by:{
        type:DataTypes.STRING
    },
    deleted_name:{
        type:DataTypes.STRING
    }

},
{
paranoid:true,
freezeTableName:true
});

rad_test.belongsTo(ms_gudang,{foreignKey:"ms_gudang_id"})
ms_gudang.hasMany(rad_test,{foreignKey:"ms_gudang_id"})

module.exports = rad_test