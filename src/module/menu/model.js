const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');


const menu = sq.define('menu',{
        id:{
            type: DataTypes.STRING,
            primaryKey: true,
        },
        code:{
            type:DataTypes.STRING
        },
        parent_code:{
            type:DataTypes.STRING
        },
        icon:{
            type:DataTypes.STRING
        },
        name:{
            type:DataTypes.STRING
        },
        route:{
            type:DataTypes.STRING
        },
        seq:{
            type:DataTypes.INTEGER
        },
        level:{
            type:DataTypes.INTEGER
        },
        is_root:{
            type:DataTypes.BOOLEAN
        },
        type:{
            type:DataTypes.INTEGER
        },
    },
    {
        paranoid:true,
        freezeTableName:true
    }
);

module.exports = menu