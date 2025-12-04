const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const tingkatAsset = sq.define('tingkatasset',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    name:{
        type:DataTypes.STRING
    },
    sequence:{
        type:DataTypes.INTEGER
    },
    status:{
        type:DataTypes.SMALLINT,
        defaultValue: 1
    },
},
{
paranoid:true,
freezeTableName:true
});

// tingkatasset.sync({alter:true})

module.exports = tingkatAsset