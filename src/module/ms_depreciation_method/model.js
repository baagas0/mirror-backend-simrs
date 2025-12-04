const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const msDepreciationMethod = sq.define('ms_depreciation_method',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    code:{
        type:DataTypes.STRING
    },
    name:{
        type:DataTypes.STRING
    },
    remark:{
        type:DataTypes.TEXT
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

// ms_depreciation_method.sync({alter:true})

module.exports = msDepreciationMethod