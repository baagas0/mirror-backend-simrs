const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const msBarang = require('../ms_barang/model');

const permintaanSteril = sq.define('permintaan_steril',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true,
    },
    kode_permintaan:{ type:DataTypes.STRING },
    nama_unit:{ type:DataTypes.STRING },
    tanggal_permintaan:{ type:DataTypes.STRING },
    status_permintaan:{ type:DataTypes.INTEGER }, // 1 = menunggu, 2 = diproses, 9 = selesai, 0 = ditolak
    keterangan:{ type:DataTypes.TEXT },
},
{
    paranoid:true,
    freezeTableName:true
});


module.exports = permintaanSteril