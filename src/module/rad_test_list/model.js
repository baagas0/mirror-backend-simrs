const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const penunjang=require('../penunjang/model')
const rad_test=require('../rad_test/model')

const rad_test_list = sq.define('rad_test_list',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    queue:{
        type:DataTypes.INTEGER
    },
    keterangan_rad_test_list:{
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

rad_test_list.belongsTo(penunjang,{foreignKey:"penunjang_id"})
penunjang.hasMany(rad_test_list,{foreignKey:"penunjang_id"})

rad_test_list.belongsTo(rad_test,{foreignKey:"rad_test_id"})
rad_test.hasMany(rad_test_list,{foreignKey:"rad_test_id"})

module.exports = rad_test_list