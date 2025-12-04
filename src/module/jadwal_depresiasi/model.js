const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const jadwalDepresiasi = sq.define('jadwal_depresiasi',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    date: {
        type: DataTypes.DATE
    },
    jumlah_asset:{
        type:DataTypes.INTEGER
    },
    depresiasi_selesai:{
        type:DataTypes.INTEGER
    },
    depresiasi_gagal:{
        type:DataTypes.INTEGER
    },
    is_proses:{
        type:DataTypes.SMALLINT
    },
},
{
    paranoid:true,
    freezeTableName:true
});

module.exports = jadwalDepresiasi