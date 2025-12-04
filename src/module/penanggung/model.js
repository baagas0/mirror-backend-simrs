const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const tagihan = require('../tagihan/model');


const penanggung = sq.define('penanggung',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    nama_penanggung:{
        type: DataTypes.STRING
    },
    jumlah_penanggung:{
        type: DataTypes.FLOAT  //2 angka dibelakang koma
    }
},
{
paranoid:true,
freezeTableName:true
});

penanggung.belongsTo(tagihan, { foreignKey: 'tagihan_id' });
tagihan.hasMany(penanggung, { foreignKey: 'tagihan_id' });

module.exports = penanggung