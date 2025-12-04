const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const msKualifikasi = sq.define('ms_kualifikasi',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_kualifikasi:{
        type:DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

// msKualifikasi.sync({alter:true})

module.exports = msKualifikasi