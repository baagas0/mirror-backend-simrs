const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');

const msLayanan = sq.define('ms_layanan',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nama_layanan:{
        type:DataTypes.STRING
    },
    kode_layanan:{
        type:DataTypes.STRING
    },
    status_layanan:{
        type:DataTypes.SMALLINT
    },
    keterangan_layanan:{
        type:DataTypes.STRING
    }
},
{
paranoid:true,
freezeTableName:true
});

// msLayanan.sync({alter:true})

module.exports = msLayanan