const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const msBarang = require('../ms_barang/model');
const permintaanSteril = require('../permintaan_steril/model');

const permintaanSterilList = sq.define('permintaan_steril_list',{
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    status_permintaan:{ type:DataTypes.INTEGER }, // 1 = menunggu, 2 = diproses, 9 = selesai, 0 = ditolak
},
{
    paranoid:true,
    freezeTableName:true
});

permintaanSterilList.belongsTo(permintaanSteril,{foreignKey:'permintaan_steril_id'});
permintaanSteril.hasMany(permintaanSterilList,{foreignKey:'permintaan_steril_id'});


permintaanSterilList.belongsTo(msBarang,{foreignKey:'ms_barang_id'});
msBarang.hasMany(permintaanSterilList,{foreignKey:'ms_barang_id'});

module.exports = permintaanSterilList