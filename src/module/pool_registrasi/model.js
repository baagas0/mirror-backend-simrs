const { DataTypes } = require('sequelize');
const {sq} =  require('../../config/connection');
const registrasi = require('../registrasi/model');
const tagihan = require('../tagihan/model');


const poolRegistrasi = sq.define('pool_registrasi',{
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    is_main:{
        type: DataTypes.BOOLEAN
    }
},
{
paranoid:true,
freezeTableName:true
});

poolRegistrasi.belongsTo(registrasi, { foreignKey: 'registrasi_id' });
registrasi.hasMany(poolRegistrasi, { foreignKey: 'registrasi_id' });

poolRegistrasi.belongsTo(tagihan, { foreignKey: 'tagihan_id' });
tagihan.hasMany(poolRegistrasi, { foreignKey: 'tagihan_id' });

module.exports = poolRegistrasi