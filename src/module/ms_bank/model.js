const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const msBank = sq.define('ms_bank',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_bank:{
        type:DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

// ms_bank.sync({alter:true})

module.exports = msBank